import { db } from "@workspace/db";
import { packagesTable, dailyTasksTable } from "@workspace/db";

async function seed() {
  console.log("Seeding packages...");
  await db.delete(packagesTable);
  await db.insert(packagesTable).values([
    { name: "VIP 1", cost: "500", dailyReturn: "35", totalYield: "245", durationDays: 7, isLocked: false, tier: "vip1", sortOrder: 1 },
    { name: "VIP 2", cost: "1000", dailyReturn: "80", totalYield: "560", durationDays: 7, isLocked: false, tier: "vip2", sortOrder: 2 },
    { name: "VIP 3", cost: "2000", dailyReturn: "180", totalYield: "1260", durationDays: 7, isLocked: false, tier: "vip3", sortOrder: 3 },
    { name: "VIP 4", cost: "5000", dailyReturn: "500", totalYield: "3500", durationDays: 7, isLocked: false, tier: "vip4", sortOrder: 4 },
    { name: "VIP 5", cost: "10000", dailyReturn: "1100", totalYield: "7700", durationDays: 7, isLocked: false, tier: "vip5", sortOrder: 5 },
    { name: "VIP Elite", cost: "25000", dailyReturn: "3000", totalYield: "21000", durationDays: 7, isLocked: true, tier: "elite", sortOrder: 6 },
    { name: "VIP Apex", cost: "50000", dailyReturn: "7000", totalYield: "49000", durationDays: 7, isLocked: true, tier: "apex", sortOrder: 7 },
    { name: "VIP Titan", cost: "100000", dailyReturn: "16000", totalYield: "112000", durationDays: 7, isLocked: true, tier: "titan", sortOrder: 8 },
    { name: "VIP Alpha", cost: "250000", dailyReturn: "45000", totalYield: "315000", durationDays: 7, isLocked: true, tier: "alpha", sortOrder: 9 },
  ]);

  console.log("Seeding daily tasks...");
  await db.delete(dailyTasksTable);
  await db.insert(dailyTasksTable).values([
    { title: "Watch a BirrStream video", description: "Watch any video on our streaming platform for 5 minutes", reward: "15", taskType: "stream_video", actionUrl: null, isActive: true },
    { title: "Visit the BirrStream homepage", description: "Open and browse the BirrStream main page for 2 minutes", reward: "10", taskType: "open_page", actionUrl: null, isActive: true },
    { title: "Join BirrStream Telegram", description: "Join our official Telegram channel for updates and bonuses", reward: "20", taskType: "join_telegram", actionUrl: "https://t.me/birrstream", isActive: true },
    { title: "Share your referral link", description: "Share your unique referral link with at least one person today", reward: "25", taskType: "other", actionUrl: null, isActive: true },
    { title: "Complete your profile", description: "Ensure your full name and email are up to date in your profile", reward: "10", taskType: "other", actionUrl: null, isActive: true },
    { title: "Watch 2 more videos", description: "Watch 2 additional streaming videos on BirrStream", reward: "20", taskType: "stream_video", actionUrl: null, isActive: true },
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
