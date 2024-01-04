import simpleGit, { SimpleGit } from "simple-git";
import fs from "fs";
import "dotenv/config";

const repositoryPath = process.cwd();
const filePath = "./README.md";

async function performCommitAndPush(): Promise<void> {
  const git: SimpleGit = simpleGit(repositoryPath);

  const date = new Date();
  const currentDay = date.getDate();
  const quantityDays = Math.floor(
    (new Date(date.getFullYear() + 1, 0, 0).getTime() -
      new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const amountCommits = (await git.log()).total;

  const content: string = `# Day ${currentDay} - ${date.getFullYear()}\n- Remaining days: ${
    quantityDays - currentDay
  }/${quantityDays}\n- Amount of commits: ${
    amountCommits + 1
  }\n\n<img src="https://raw.githubusercontent.com/AutoCommitDev/AutoCommitDev/output/snake.svg" alt="Snake animation"/>\n\nAuto Commit - Made by [LautyDev](https://github.com/LautyDev)`;

  fs.writeFileSync(filePath, content);

  await git.add(filePath);

  const commitMessage: string = `📅 Automated commit: Day ${currentDay}.`;
  await git.commit(commitMessage);

  console.log(`Commit was made: ${commitMessage}`);

  async function sendMessageDiscord(message: string) {
    await fetch(process.env.DISCORD_WEBHOOK as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
  }

  try {
    await git.push("origin", "main");
    console.log("The remote repository was pushed.");

    await sendMessageDiscord(`**Commit was made:** ${commitMessage}`);
  } catch (error: any) {
    await sendMessageDiscord(
      `An error occurred while pushing.\n\`\`\`${error}\`\`\``
    );
  }
}

function wait24Hours(): Promise<void> {
  const millisecondsInADay: number = 24 * 60 * 60 * 1000;
  return new Promise((resolve) => setTimeout(resolve, millisecondsInADay));
}

async function runScript() {
  while (true) {
    await performCommitAndPush();
    await wait24Hours();
  }
}

runScript().catch((error: Error) => console.error(error));
