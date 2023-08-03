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
    console.log("Successful request");
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
    console.log("Failed request");
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
    const report = await Report.findOne({ check: check._id }).populate(
      "history"
    );
    const client = axios.create({
      baseURL: `${check.protocol}://${check.url}:${check.port}`,
      auth: check.authentication,
      timeout: check.timeout,
      headers: check.headers,
    });
    axiosRetry(client, { retries: check.threshold });
    try {
      const response = await client.get(check.path, {
        allowRedirects: false,
        maxRedirects: 0,
      });
      const responseTime = Date.now() - startTime;
      report.responseTime =
        (report.responseTime * report.history.length + responseTime) /
        (report.history.length + 1);
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
      console.log("Error: ", err);
      //   if the error is a redirect error with status starts with 3 call the successful request method
      const responseTime = Date.now() - startTime;
      if (err.response && err.response.status.toString().startsWith("3")) {
        await this.successfulRequest(report, responseTime, check.interval);
      } else {
        await this.failedRequest(report, responseTime, check.interval);
      }
    }
  }

  //   schedule task for a check
  async scheduleTask(check) {
    console.log(`Scheduling task for ${check.name}`);
    const task = cron.schedule(
      `*/${check.interval} * * * *`,
      async () => await this.checkAvailability(check)
    );
    this.tasks[check._id] = task;
    await task.start();
  }

  // run the jobs when the server restarts
  async runJobs() {
    const checks = await Check.find();
    checks?.map(async (check) => {
      await this.scheduleTask(check);
    });
  }
} // End of class

module.exports = new UptimeReportJob();
