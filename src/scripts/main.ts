import AWS from 'aws-sdk';
import { Response, Robot } from 'hubot'
import { SlackAdapter } from 'hubot-slack'

const accountId = process.env.ACCOUNT_ID;
if (!accountId) {
  throw new Error("No account id");
}

module.exports = async function main(robot: Robot<SlackAdapter>) {
  robot.respond(/who is in ([a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12})$/, async (res: Response<SlackAdapter>) => {
    const meetingId = res.match[1];
    const chime = new AWS.Chime({region: 'us-east-1'});

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

    const users = await Promise.all(response.Attendees.map(async attendee => {
      if (!attendee.AttendeeId) return "Unknown";
      const user = await chime.getUser({
        AccountId: accountId,
        UserId: attendee.AttendeeId
      }).promise();
      if (!user) return "Unknown";
      if (!user.User) return "Unknown";
      return user.User.DisplayName || user.User.UserId;
    }));
    res.send(users.join(", "));
  })
}
