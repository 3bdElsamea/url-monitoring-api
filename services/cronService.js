const cron = require("node-cron");
const axios = require("axios");
const axiosRetry = require("axios-retry");

const Report = require("../models/Report");
const Check = require("../models/Check");

class UptimeReportJob {
  constructor() {
    this.tasks = {};
  }

  async successfulRequest(report, responseTime, interval) {
    const statusChanged = report.status !== "up";
    let uptime = report.uptime + interval;
    report.availability = (uptime / (uptime + report.downtime)) * 100; // calculate availability percentage
    report.uptime = uptime;
    report.status = "up";
    report.history.push({
      status: "up",
      responseTime,
    });
    await report.save();
    if (statusChanged) {
      await report.sendStatusChangeEmail();
    }
  }

  async failedRequest(report, responseTime, interval) {
    const statusChanged = report.status !== "down";
    report.outages++;
    report.downtime = report.downtime + interval;
    report.status = "down";
    report.history.push({
      status: "down",
      responseTime,
    });
    await report.save();
    if (statusChanged) {
      await report.sendStatusChangeEmail();
    }
  }

  // This is the method that will be called by the cron job to check the status of the url
  async checkAvailability(check) {
    const startTime = Date.now();
    const report = await Report.findOne({ check: check._id });
    const client = axios.create({
      baseURL: `${check.protocol}://${check.url}:${check.port}`,
      auth: check.authentication,
      timeout: check.timeout,
    });
    axiosRetry(client, { retries: check.threshold });
    try {
      const response = await client.get(check.path);
      const responsesCount = report.history.length;
      const responseTime = Date.now() - startTime;
      report.responseTime =
        (report.responseTime * responsesCount + responseTime) /
        (responsesCount + 1);
      // if the report has assertions or the response status code is failed with code starts with 4 or 5
      if (
        (check.assert && response.status !== check.assert.statusCode) ||
        (!check.assert && response.status >= 400)
      ) {
        await this.failedRequest(report, responseTime, check.interval);
      } else {
        await this.successfulRequest(report, responseTime, check.interval);
      }

      await report.save();

      // if the response throws an error
    } catch (err) {
      await this.failedRequest(report, check.timeout, check.interval);
    }
  }

  //   schedule task for a check
  async scheduleTask(check) {
    console.log(`Scheduling task for ${check.name}`);
    const task = cron.schedule(
      `*/${check.interval} * * * * *`,
      async () => await this.checkAvailability(check)
    );
    this.tasks[check._id] = task;
    await task.start();
  }

  // run the jobs when the server starts
  async runJobs() {
    const checks = await Check.find();
    //   map through the checks and schedule a task for each check
    checks.map(async (check) => {
      await this.scheduleTask(check);
    });
  }
} // End of class

module.exports = new UptimeReportJob();
