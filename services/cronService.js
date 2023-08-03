const cron = require("node-cron");
const axios = require("axios");
const axiosRetry = require("axios-retry");

const { Report, History } = require("../models/Report");
const Check = require("../models/Check");

class UptimeReportJob {
  constructor() {
    this.tasks = {};
  }

  async successfulRequest(report, responseTime, interval) {
    const statusChanged = report.status;
    let uptime = report.uptime + interval;
    report.availability = (uptime / (uptime + report.downtime)) * 100; // calculate availability percentage
    report.uptime = uptime;
    report.status = "up";
    await History.create({
      report_id: report._id,
      status: "up",
      responseTime,
    });
    await report.save();
    if (statusChanged === "down") {
      await report.sendStatusEmail();
    }
  }

  async failedRequest(report, responseTime, interval) {
    const statusChanged = report.status;
    report.outages++;
    report.downtime = report.downtime + interval;
    report.status = "down";
    await History.create({
      report_id: report._id,
      status: "down",
      responseTime,
    });
    await report.save();
    if (statusChanged === "up") {
      await report.sendStatusEmail();
    }
  }

  // This is the method that will be called by the cron job to check the status of the url
  async checkAvailability(check) {
    const startTime = Date.now();
    const report = await Report.findOne({ check: check._id });
    console.log(report._doc);
    const client = axios.create({
      baseURL: `${check.protocol}://${check.url}:${check.port}`,
      auth: check.authentication,
      timeout: check.timeout,
      headers: check.headers,
    });
    console.log(`${check.protocol}://${check.url}:${check.port}`);
    axiosRetry(client, { retries: check.threshold });
    try {
      console.log("Checking availability");
      const response = await client.get(check.path, {
        allowRedirects: false,
      });
      // console.log("Response: ", response.status);
      // console.log("Location: ", response.headers);
      const responseTime = Date.now() - startTime;
      report.responseTime = (report.responseTime + responseTime) / 2;
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
      // console.log("Error: ", err.response.status);
      console.log("Error: ", err);
      await this.failedRequest(report, check.timeout, check.interval);
    }
  }

  //   schedule task for a check
  async scheduleTask(check) {
    console.log(`Scheduling task for ${check.name}`);
    const task = cron.schedule(
      `*/1 * * * *`,
      async () => await this.checkAvailability(check)
    );
    this.tasks[check._id] = task;
    await task.start();
  }

  // run the jobs when the server starts
  async runJobs() {
    const checks = await Check.find();
    checks.map(async (check) => {
      await this.scheduleTask(check);
    });
  }
} // End of class

module.exports = new UptimeReportJob();
