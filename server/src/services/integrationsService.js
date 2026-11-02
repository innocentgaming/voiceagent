/**
 * IndicVoice Lab - Integrations Service (Jira, Slack, HRMS)
 * Provides:
 * - Jira Issue Auto-Creation on Critical Entity Failure
 * - Slack Alert Webhook Notifier with rich card blocks
 * - Mock HRMS Employee Directory Provider for enterprise voice bots
 */

class IntegrationsService {
  constructor() {
    this.jiraIssues = [];
    this.slackNotifications = [];
    this.config = {
      jiraEnabled: true,
      jiraProjectKey: 'INDIC',
      slackEnabled: true,
      slackChannel: '#voice-ai-incidents'
    };
  }

  /**
   * Automatically files a Jira issue when a test run fails a critical entity check
   */
  async fileJiraBug(run, testCase) {
    const issueKey = `${this.config.jiraProjectKey}-${100 + this.jiraIssues.length + 1}`;
    const issue = {
      key: issueKey,
      title: `[Voice Failure] Critical Entity Mismatch in ${testCase.name || 'Voice Test'}`,
      priority: 'Highest',
      status: 'OPEN',
      labels: ['speech-recognition', 'indic-voice-lab', 'gnani-prisma', testCase.language || 'hindi'],
      description: `
*Expected Transcript*: ${run.expectedTranscription}
*Prisma Transcript*: ${run.predictedTranscription}
*Word Error Rate (WER)*: ${run.wer}%
*Character Error Rate (CER)*: ${run.cer}%
*Language*: ${testCase.language}
*Critical Entities Failed*:
${(run.entityEvaluation?.evaluatedEntities || [])
  .filter(e => !e.matched)
  .map(e => `- ${e.name} (${e.type}): Expected "${e.expectedValue}"`)
  .join('\n')}
      `.trim(),
      createdAt: new Date().toISOString()
    };

    this.jiraIssues.unshift(issue);
    return issue;
  }

  /**
   * Dispatches Slack webhook alert
   */
  async sendSlackAlert(run, testCase) {
    const notification = {
      id: `slack-${Date.now()}`,
      channel: this.config.slackChannel,
      title: `🚨 IndicVoice Alert: Critical Entity Mismatch in ${testCase.name}`,
      wer: `${run.wer}%`,
      cer: `${run.cer}%`,
      expected: run.expectedTranscription,
      predicted: run.predictedTranscription,
      timestamp: new Date().toISOString()
    };

    this.slackNotifications.unshift(notification);
    return notification;
  }

  /**
   * Enterprise HRMS Directory Lookup
   */
  getHRMSEmployees() {
    return [
      { id: 'EMP-101', name: 'Rahul Sharma', role: 'Staff Software Engineer', dept: 'AI Platform', email: 'rahul.sharma@enterprise.in' },
      { id: 'EMP-102', name: 'Rohan Gupta', role: 'Product Manager', dept: 'Voice Core', email: 'rohan.gupta@enterprise.in' },
      { id: 'EMP-103', name: 'Priya Deshmukh', role: 'Linguistic QA Specialist', dept: 'Indic NLP', email: 'priya.d@enterprise.in' }
    ];
  }

  listJiraIssues() {
    return this.jiraIssues;
  }

  listSlackAlerts() {
    return this.slackNotifications;
  }
}

const integrationsService = new IntegrationsService();

module.exports = {
  integrationsService
};

