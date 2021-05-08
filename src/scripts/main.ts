import AWS from 'aws-sdk';
import { Response, Robot } from 'hubot'
import { SlackAdapter } from 'hubot-slack'

module.exports = async function main(robot: Robot<SlackAdapter>) {
  robot.respond(/^who is in (\W)$/, async (res: Response<SlackAdapter>) => {
    const meetingId = res.match[1];
    const chime = new AWS.Chime({region: 'eu-west-1'});
    const response = await chime.listAttendees({
      MeetingId: meetingId,
    }).promise();
    if (!response) {
      res.send("error");
      return;
    }
    if (!response.Attendees) {
      res.send("There are no attendees.");
      return;
    }
    res.send(response.Attendees.map(attendee => `@${attendee.AttendeeId}`).join(", "));
  })
}
