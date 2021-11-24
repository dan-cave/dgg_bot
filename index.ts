import Snoowrap, { Comment, RedditUser } from "snoowrap";
import { CommentStream, SnooStormOptions } from "snoostorm";
import { Evidence } from "./types";
import { config } from "dotenv";

config();
const reddit = new Snoowrap({
  userAgent: "dgg-bot-bing-chilling",
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS,
});

const stormOpts: SnooStormOptions = {
  subreddit: "all",
  pollTime: 500,
};

const commentStream = new CommentStream(reddit, stormOpts);

commentStream.on("item", async (item: Comment): Promise<void> => {
  if (
    item.body.match(/[Dd]\.?[Gg]{1,2}[ \-_]check\.?$/g) ||
    item.body === "/u/dgg_check"
  ) {
    const parent = reddit.getComment(item.parent_id).author;
    let verdict;
    if (parent.name === "dgg_check") {
      return;
    } else if (parent.name === "neodestiny") {
      verdict = `Thank you for your request, /u/${item.author.name}. 999 of /u/${parent.name}'s last 1000 comments (99.90%) are in /r/vaushV (and 1 comment in /r/kaceytron lol loser). Absolutely psychotic.`;
    } else {
      const evidence = await dggCheck(parent, "destiny");
      verdict = `Thank you for your request, /u/${item.author.name}. ${evidence.degenCount} of /u/${parent.name}'s last ${evidence.commentCount} comments (${evidence.percentage}%) are in /r/destiny`;
    }
    item.reply(verdict);
  }
});

async function dggCheck(author: RedditUser, subreddit: string): Promise<Evidence> {
  const commentListing = await author.getComments();
  const comments = await commentListing.fetchMore({
    amount: 1000,
  });
  const degenCount = comments.filter(
    (comment) => comment.subreddit.display_name.toLowerCase() === subreddit.toLowerCase()
  ).length;

  return {
    degenCount,
    commentCount: comments.length,
    percentage: degenCount / comments.length * 100,
  };
}

