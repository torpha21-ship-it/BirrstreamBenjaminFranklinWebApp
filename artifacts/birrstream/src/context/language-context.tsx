import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "am";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string, fallback?: string) => string;
  isAmharic: boolean;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Common
    "nav.home": "Home",
    "nav.tasks": "Daily Tasks",
    "nav.deposit": "Deposit",
    "nav.withdraw": "Withdraw",
    "nav.packages": "VIP Packages",
    "nav.games": "Arcade Games",
    "nav.profile": "Profile",
    "nav.admin": "Admin Panel",
    "nav.balance": "Balance",
    "nav.referrals": "Referrals",
    "nav.transactions": "Transactions",
    "nav.vip_upgrades": "VIP Upgrades",
    "nav.support": "Support",

    // Common words
    "common.back": "Back",
    "common.continue": "Continue",
    "common.confirm": "Confirm",
    "common.cancel": "Cancel",
    "common.submit": "Submit",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.copy": "Copy",
    "common.copied": "Copied!",
    "common.status": "Status",
    "common.amount": "Amount",
    "common.date": "Date",
    "common.etb": "ETB",
    "common.day": "day",
    "common.days": "days",
    "common.days_left": "d left",
    "common.completed": "Completed",
    "common.pending": "Pending",
    "common.rejected": "Rejected",
    "common.approved": "Approved",

    // Dashboard
    "dash.welcome": "Welcome back",
    "dash.main_balance": "Main Balance",
    "dash.current_balance": "Current Available Balance",
    "dash.deposit": "Deposit",
    "dash.withdraw": "Withdraw",
    "dash.packages": "Packages",
    "dash.tasks": "Tasks",
    "dash.deposit_sub": "Add funds instant",
    "dash.withdraw_sub": "Fast payout",
    "dash.referral_network": "My Referral Network",
    "dash.referral_sub": "View your affiliate downline & earnings",
    "dash.daily_tasks": "Daily Tasks",
    "dash.daily_tasks_sub": "Complete habits & earn Birr daily",
    "dash.time_cards": "Time Cards",
    "dash.time_cards_sub": "Hourly yield boosters",
    "dash.login_streak": "Login Streak",
    "dash.login_streak_sub": "Daily check-in multiplier",
    "dash.check_in": "Check In — Earn +5 ETB",
    "dash.checking_in": "Checking in...",
    "dash.checked_in": "Checked in today!",
    "dash.vip_upgrade": "VIP Upgrade Goals",
    "dash.vip_upgrade_sub": "Earn premium packages through referrals",
    "dash.progress_to_vip": "Progress to",
    "dash.get_vip": "Get a VIP Package",
    "dash.pending_withdrawal": "Pending Withdrawal",
    "dash.checked_in_legend": "Checked in",
    "dash.today_legend": "Today",
    "dash.missed_legend": "Missed",
    "dash.partner_brands": "Official Ecosystem Partners",

    // Stat Cards
    "stats.total_yield": "Total Yield",
    "stats.total_deposited": "Total Deposited",
    "stats.total_withdrawn": "Total Withdrawn",
    "stats.reserve_floor": "Reserve Floor",

    // Tasks
    "tasks.title": "Daily Tasks",
    "tasks.subtitle": "Complete tasks to earn Birr rewards instantly",
    "tasks.completed_today": "Tasks completed today",
    "tasks.available_to_earn": "available to earn",
    "tasks.tip_title": "Daily Tip",
    "tasks.tip_desc": "Complete all tasks daily to maximise your earnings. Tasks reset at midnight.",
    "tasks.new_habits": "New habits for you",
    "tasks.no_tasks": "No tasks today",
    "tasks.check_back": "Check back later",
    "tasks.earned": "earned!",
    "tasks.already_completed": "Task already completed today",

    // Profile
    "profile.title": "My Profile",
    "profile.account_section": "Account",
    "profile.network_section": "Network",
    "profile.danger_zone": "Danger Zone",
    "profile.withdrawal_settings": "Withdrawal Settings",
    "profile.transaction_history": "Transaction History",
    "profile.my_referrals": "My Referral Code",
    "profile.affiliate_network": "Affiliate Network",
    "profile.vip_upgrades": "VIP Upgrade Goals",
    "profile.delete_account": "Delete Account",
    "profile.sign_out": "Sign out",
    "profile.member_since": "Member since",
    "profile.naomi_member": "Naomi Labs Member",
    "profile.main_balance": "Main Balance",
    "profile.total_yield": "Total Yield",
    "profile.total_deposited": "Total Deposited",
    "profile.total_withdrawn": "Total Withdrawn",
    "profile.photo_updated": "Profile photo updated!",
    "profile.upload_failed": "Upload failed",

    // Packages / VIP
    "packages.title": "VIP Packages",
    "packages.subtitle": "Invest in a package and receive daily yields directly to your balance.",
    "packages.active_package": "Active Package",
    "packages.daily_return": "Daily Return",
    "packages.duration": "Duration",
    "packages.total_return": "Total Return",
    "packages.price": "Price",
    "packages.buy_now": "Activate Package",
    "packages.expires_in": "Expires in",
    "packages.current_active": "Currently Active",
    "packages.insufficient_funds": "Insufficient balance. Please deposit first.",
    "packages.activated_success": "Package activated successfully!",

    // Deposit Page
    "deposit.title": "Deposit Funds",
    "deposit.subtitle": "Select a payment method and enter the amount you wish to deposit.",
    "deposit.enter_amount": "Enter Deposit Amount",
    "deposit.select_method": "Select Payment Method",
    "deposit.telebirr": "Telebirr",
    "deposit.cbe_birr": "CBE Birr",
    "deposit.bank_transfer": "Bank Transfer (CBE / Awash / Dashen)",
    "deposit.min_deposit": "Minimum deposit: 100 ETB",
    "deposit.account_number": "Account Number",
    "deposit.account_name": "Account Name",
    "deposit.reference": "Transaction Reference / Screenshot",
    "deposit.upload_proof": "Upload Payment Receipt",
    "deposit.confirm_deposit": "Submit Deposit",
    "deposit.deposit_pending": "Deposit request submitted. Pending verification.",
    "deposit.instructions": "Transfer the exact amount to the account below and submit your transaction reference.",

    // Withdraw Page
    "withdraw.title": "Withdraw Funds",
    "withdraw.subtitle": "Withdraw your earnings directly to your mobile wallet or bank.",
    "withdraw.enter_amount": "Enter Withdrawal Amount",
    "withdraw.available_balance": "Available for withdrawal",
    "withdraw.min_withdraw": "Minimum withdrawal: 200 ETB",
    "withdraw.withdrawal_fee": "Processing Fee: 0%",
    "withdraw.select_destination": "Select Destination Account",
    "withdraw.confirm_withdraw": "Request Payout",
    "withdraw.success_msg": "Withdrawal request submitted! Payout will be processed shortly.",

    // Referral & Affiliate
    "referral.title": "Referral Program",
    "referral.subtitle": "Share your referral link and earn commissions from every active package activated by your invitees.",
    "referral.your_code": "Your Referral Code",
    "referral.your_link": "Your Referral Link",
    "referral.copy_link": "Copy Invite Link",
    "referral.total_referrals": "Total Referrals",
    "referral.referral_earnings": "Referral Earnings",
    "referral.tier1": "Level 1 (Direct): 10%",
    "referral.tier2": "Level 2: 5%",
    "referral.tier3": "Level 3: 2%",
    "referral.how_it_works": "How It Works",
    "referral.step1": "Share your unique invite link with friends",
    "referral.step2": "They sign up and activate any VIP package",
    "referral.step3": "You get instant commission credited to your balance",

    // Transactions Page
    "tx.title": "Transaction History",
    "tx.subtitle": "Track all deposits, withdrawals, yields, and task rewards.",
    "tx.all": "All",
    "tx.deposits": "Deposits",
    "tx.withdrawals": "Withdrawals",
    "tx.earnings": "Earnings",
    "tx.no_transactions": "No transactions found",

    // Support Page
    "support.title": "Customer Support",
    "support.subtitle": "Need assistance? Our 24/7 support team is here to help.",
    "support.telegram_channel": "Official Telegram Channel",
    "support.telegram_bot": "24/7 Telegram Support Bot",
    "support.email": "Email Support",
    "support.faq": "Frequently Asked Questions",

    // Games / Arcade
    "games.title": "Naomi Arcade",
    "games.subtitle": "Play games & earn Birr rewards",
    "games.featured": "Minecraft Mob Spinner",
    "games.featured_desc": "Spin the auto-picker to randomly land on 1 of 15 mobs. Win up to +215 ETB with Diamond Panda or dodge Creeper TNT traps! Tiered daily spins per VIP level (VIP 4+ Unlimited).",
    "games.play_now": "START MOB SPINNER",
    "games.spin_button": "START AUTO-PICKER (SPIN)",
    "games.spinning": "SPINNING AUTO-PICKER...",
    "games.back_to_arcade": "Back to Arcade",
    "games.roster_title": "Selected Mob Roster (15 Mobs)",
    "games.power_rating": "Power Rating:",
    "games.agility_stat": "Agility Stat:",
    "games.birr_potential": "Birr Potential:",
    "games.special_skill": "Special Skill:",
    "games.jackpot": "JACKPOT REWARD!",
    "games.you_won": "YOU WON BIRR!",
    "games.penalty": "PENALTY TRAP!",
    "games.landed_on": "Landed on",
    "games.continue_playing": "CONTINUE PLAYING",
    "games.spins_remaining": "Spins Remaining Today:",
    "games.unlimited": "Unlimited",
    "games.tier_info": "Tier Spins",
  },
  am: {
    // Nav & Common
    "nav.home": "መነሻ",
    "nav.tasks": "የዕለት ተግባራት",
    "nav.deposit": "ገንዘብ አስገባ",
    "nav.withdraw": "ገንዘብ አውጣ",
    "nav.packages": "የቪአይፒ ፓኬጆች",
    "nav.games": "የአርኬድ ጨዋታዎች",
    "nav.profile": "መገለጫ",
    "nav.admin": "የአስተዳዳሪ ክፍል",
    "nav.balance": "ቀሪ ሂሳብ",
    "nav.referrals": "ሪፈራሎች",
    "nav.transactions": "የግብይት ታሪክ",
    "nav.vip_upgrades": "የቪአይፒ ደረጃዎች",
    "nav.support": "እርዳታ",

    // Common words
    "common.back": "ተመለስ",
    "common.continue": "ቀጥል",
    "common.confirm": "አረጋግጥ",
    "common.cancel": "ሰርዝ",
    "common.submit": "አስገባ",
    "common.loading": "በመጫን ላይ...",
    "common.save": "አስቀምጥ",
    "common.copy": "ቅዳ",
    "common.copied": "ተቀድቷል!",
    "common.status": "ሁኔታ",
    "common.amount": "የብር መጠን",
    "common.date": "ቀን",
    "common.etb": "ብር",
    "common.day": "ቀን",
    "common.days": "ቀናት",
    "common.days_left": "ቀናት ቀርተዋል",
    "common.completed": "ተጠናቋል",
    "common.pending": "በመጠባበቅ ላይ",
    "common.rejected": "ውድቅ ተደርጓል",
    "common.approved": "ተቀባይነት አግኝቷል",

    // Dashboard
    "dash.welcome": "እንኳን ደህና መጡ",
    "dash.main_balance": "ዋና ቀሪ ሂሳብ",
    "dash.current_balance": "አሁን የሚገኝ ቀሪ ሂሳብ",
    "dash.deposit": "ተቀማጭ",
    "dash.withdraw": "ገንዘብ ማውጣት",
    "dash.packages": "ፓኬጆች",
    "dash.tasks": "ተግባራት",
    "dash.deposit_sub": "ፈጣን ተቀማጭ ያድርጉ",
    "dash.withdraw_sub": "ፈጣን ክፍያ ያግኙ",
    "dash.referral_network": "የግብዣ አውታረ መረብ",
    "dash.referral_sub": "የተጋበዙ አባላትን እና ያገኙትን ትርፍ ይመልከቱ",
    "dash.daily_tasks": "የዕለት ተግባራት",
    "dash.daily_tasks_sub": "ተግባራትን በማከናወን በየቀኑ ብር ያግኙ",
    "dash.time_cards": "የጊዜ ካርዶች",
    "dash.time_cards_sub": "የሰዓት ትርፍ ማሳደጊያዎች",
    "dash.login_streak": "የዕለት ተሳትፎ",
    "dash.login_streak_sub": "የዕለታዊ መግቢያ ጉርሻ",
    "dash.check_in": "ተሳትፎ ይመዝግቡ — +5 ብር ያግኙ",
    "dash.checking_in": "በመመዝገብ ላይ...",
    "dash.checked_in": "የዛሬው ተሳትፎ ተመዝግቧል!",
    "dash.vip_upgrade": "የቪአይፒ ግቦች",
    "dash.vip_upgrade_sub": "በግብዣዎች አማካኝነት ነፃ ፓኬጆችን ያግኙ",
    "dash.progress_to_vip": "ወደ ቪአይፒ ደረጃ እድገት፦",
    "dash.get_vip": "የቪአይፒ ፓኬጅ ይውሰዱ",
    "dash.pending_withdrawal": "በመጠባበቅ ላይ ያለ ገንዘብ",
    "dash.checked_in_legend": "የተመዘገበ",
    "dash.today_legend": "ዛሬ",
    "dash.missed_legend": "ያመለጠ",
    "dash.partner_brands": "ይፋዊ አጋር ድርጅቶች",

    // Stat Cards
    "stats.total_yield": "ጠቅላላ ትርፍ",
    "stats.total_deposited": "ጠቅላላ ተቀማጭ",
    "stats.total_withdrawn": "ጠቅላላ የወጣ",
    "stats.reserve_floor": "የተቀመጠ ገንዘብ",

    // Tasks
    "tasks.title": "የዕለት ተግባራት",
    "tasks.subtitle": "ተግባራትን በማጠናቀቅ የብር ሽልማቶችን ወዲያውኑ ያግኙ",
    "tasks.completed_today": "ዛሬ የተጠናቀቁ ተግባራት",
    "tasks.available_to_earn": "ለማግኘት ይገኛል",
    "tasks.tip_title": "የዕለት ጠቃሚ ምክር",
    "tasks.tip_desc": "ገቢዎን ከፍ ለማድረግ ሁሉንም የዕለት ተግባራት ያጠናቅቁ። ተግባራት በየእኩለ ሌሊት ይታደሳሉ።",
    "tasks.new_habits": "አዳዲስ ልምዶች ለእርስዎ",
    "tasks.no_tasks": "ዛሬ ምንም ተግባራት የሉም",
    "tasks.check_back": "በኋላ እንደገና ይመልከቱ",
    "tasks.earned": "ብር አግኝተዋል!",
    "tasks.already_completed": "ይህ ተግባር ዛሬ አስቀድሞ ተጠናቋል",

    // Profile
    "profile.title": "የእኔ መገለጫ",
    "profile.account_section": "የመለያ መረጃ",
    "profile.network_section": "አውታረ መረብ",
    "profile.danger_zone": "አደገኛ እርምጃ",
    "profile.withdrawal_settings": "የማውጫ ቅንብሮች",
    "profile.transaction_history": "የግብይት ታሪክ",
    "profile.my_referrals": "የእኔ የግብዣ ኮድ",
    "profile.affiliate_network": "የግብዣ አውታረ መረብ",
    "profile.vip_upgrades": "የቪአይፒ ግቦች",
    "profile.delete_account": "መለያ ሰርዝ",
    "profile.sign_out": "ውጣ",
    "profile.member_since": "የተመዘገቡበት ቀን፦",
    "profile.naomi_member": "ናኦሚ ላብስ አባል",
    "profile.main_balance": "ዋና ቀሪ ሂሳብ",
    "profile.total_yield": "ጠቅላላ ትርፍ",
    "profile.total_deposited": "ጠቅላላ ተቀማጭ",
    "profile.total_withdrawn": "ጠቅላላ የወጣ",
    "profile.photo_updated": "የመገለጫ ፎቶ በተሳካ ሁኔታ ተዘምኗል!",
    "profile.upload_failed": "ፎቶ መጫን አልተሳካም",

    // Packages / VIP
    "packages.title": "የቪአይፒ ፓኬጆች",
    "packages.subtitle": "ፓኬጅ በመግዛት ዕለታዊ ትርፍ በቀጥታ ወደ ሂሳብዎ ያግኙ።",
    "packages.active_package": "ንቁ ፓኬጅ",
    "packages.daily_return": "ዕለታዊ ገቢ",
    "packages.duration": "የቆይታ ጊዜ",
    "packages.total_return": "ጠቅላላ ትርፍ",
    "packages.price": "ዋጋ",
    "packages.buy_now": "ፓኬጁን ይግዙ",
    "packages.expires_in": "የሚያበቃበት ጊዜ",
    "packages.current_active": "አሁን የሚሰራ",
    "packages.insufficient_funds": "በቂ ቀሪ ሂሳብ የለም። እባክዎ መጀመሪያ ገንዘብ ያስገቡ።",
    "packages.activated_success": "ፓኬጁ በተሳካ ሁኔታ ነቅቷል!",

    // Deposit Page
    "deposit.title": "ገንዘብ ማስገቢያ",
    "deposit.subtitle": "የመክፈያ ዘዴ ይምረጡ እና ማስገባት የሚፈልጉትን የብር መጠን ያስገቡ።",
    "deposit.enter_amount": "የተቀማጭ ብር መጠን",
    "deposit.select_method": "የመክፈያ ዘዴ ይምረጡ",
    "deposit.telebirr": "ቴሌብር (Telebirr)",
    "deposit.cbe_birr": "ሲቢኢ ብር (CBE Birr)",
    "deposit.bank_transfer": "የባንክ ሂሳብ (ንግድ ባንክ / አዋሽ / ዳሽን)",
    "deposit.min_deposit": "ዝቅተኛው ተቀማጭ፦ 100 ብር",
    "deposit.account_number": "የሂሳብ ቁጥር",
    "deposit.account_name": "የሂሳብ ስም",
    "deposit.reference": "የግብይት ማረጋገጫ ቁጥር / ስክሪንሾት",
    "deposit.upload_proof": "የደረሰኝ ፎቶ ጫን",
    "deposit.confirm_deposit": "ተቀማጩን አስገባ",
    "deposit.deposit_pending": "የተቀማጭ ጥያቄዎ ገብቷል፣ በማረጋገጥ ላይ ነው።",
    "deposit.instructions": "ትክክለኛውን የገንዘብ መጠን ከታች ወዳለው ሂሳብ ያስተላልፉና ማረጋገጫውን ይላኩ።",

    // Withdraw Page
    "withdraw.title": "ገንዘብ ማውጫ",
    "withdraw.subtitle": "ያገኙትን ትርፍ በቀጥታ ወደ ሞባይል ዋሌት ወይም ባንክ ሂሳብዎ ያውጡ።",
    "withdraw.enter_amount": "የማውጫ ብር መጠን ያስገቡ",
    "withdraw.available_balance": "ለማውጣት የሚገኝ ቀሪ ሂሳብ",
    "withdraw.min_withdraw": "ዝቅተኛው ማውጫ፦ 200 ብር",
    "withdraw.withdrawal_fee": "የአገልግሎት ክፍያ፦ 0%",
    "withdraw.select_destination": "የመቀበያ ሂሳብ ይምረጡ",
    "withdraw.confirm_withdraw": "ገንዘቡ እንዲላክ ጠይቅ",
    "withdraw.success_msg": "የማውጣት ጥያቄዎ በተሳካ ሁኔታ ገብቷል! በቅርቡ ይላክልዎታል።",

    // Referral & Affiliate
    "referral.title": "የግብዣ ፕሮግራም",
    "referral.subtitle": "የግብዣ ሊንክዎን በማጋራት ከተጋባዦችዎ ገቢ የኮሚሽን ትርፍ ያግኙ።",
    "referral.your_code": "የእርስዎ የግብዣ ኮድ",
    "referral.your_link": "የእርስዎ የግብዣ ሊንክ",
    "referral.copy_link": "ሊንኩን ቅዳ",
    "referral.total_referrals": "ጠቅላላ የተጋበዙ",
    "referral.referral_earnings": "ከግብዣ የተገኘ ትርፍ",
    "referral.tier1": "ደረጃ 1 (ቀጥታ)፦ 10%",
    "referral.tier2": "ደረጃ 2፦ 5%",
    "referral.tier3": "ደረጃ 3፦ 2%",
    "referral.how_it_works": "እንዴት ይሰራል?",
    "referral.step1": "የእርስዎን ልዩ ሊንክ ለጓደኞችዎ ያጋሩ",
    "referral.step2": "ተመዝግበው ማንኛውንም የቪአይፒ ፓኬጅ ይገዛሉ",
    "referral.step3": "ወዲያውኑ የኮሚሽን ትርፍ ወደ ሂሳብዎ ይገባል",

    // Transactions Page
    "tx.title": "የግብይት ታሪክ",
    "tx.subtitle": "ሁሉንም የተቀማጭ፣ የማውጫ፣ የትርፍ እና የተግባራት ገቢዎች ይከታተሉ።",
    "tx.all": "ሁሉም",
    "tx.deposits": "ተቀማጮች",
    "tx.withdrawals": "የወጡ",
    "tx.earnings": "ትርፎች",
    "tx.no_transactions": "ምንም የተመዘገበ ግብይት የለም",

    // Support Page
    "support.title": "የደንበኞች አገልግሎት",
    "support.subtitle": "እርዳታ ይፈልጋሉ? የድጋፍ ሰጪ ቡድናችን በማንኛውም ሰዓት ዝግጁ ነው።",
    "support.telegram_channel": "ይፋዊ የቴሌግራም ቻናል",
    "support.telegram_bot": "24/7 የቴሌግራም ድጋፍ ቦት",
    "support.email": "የኢሜይል ድጋፍ",
    "support.faq": "ተደጋግመው የሚጠየቁ ጥያቄዎች",

    // Games / Arcade
    "games.title": "ናኦሚ አርኬድ",
    "games.subtitle": "ጨዋታዎችን ይጫወቱ እና የብር ሽልማት ያግኙ",
    "games.featured": "የማይንክራፍት ካራክተር መምረጫ",
    "games.featured_desc": "ካራክተር በማሽከርከር እስከ 215 ብር ፈጣን የገንዘብ ሽልማት ያሸንፉ! በየደረጃው የተመደበ ዕለታዊ ማሽከርከሪያ ይኖርዎታል።",
    "games.play_now": "ጨዋታውን ይጀምሩ",
    "games.spin_button": "አሽከርክር እና ምረጥ",
    "games.spinning": "በማሽከርከር ላይ...",
    "games.back_to_arcade": "ወደ አርኬድ ተመለስ",
    "games.roster_title": "የተመረጡ 15 ካራክተሮች",
    "games.power_rating": "የኃይል ደረጃ፦",
    "games.agility_stat": "ፍጥነት፦",
    "games.birr_potential": "የብር መጠን፦",
    "games.special_skill": "ልዩ ችሎታ፦",
    "games.jackpot": "ትልቅ ሽልማት (JACKPOT)!",
    "games.you_won": "ብር አሸንፈዋል!",
    "games.penalty": "የቅጣት ወጥመድ!",
    "games.landed_on": "ያረፈበት ካራክተር፦",
    "games.continue_playing": "መጫወቱን ይቀጥሉ",
    "games.spins_remaining": "ዛሬ የቀሩ ማሽከርከሪያዎች፦",
    "games.unlimited": "ያልተገደበ",
    "games.tier_info": "የደረጃ ማሽከርከሪያዎች",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("birrstream_lang");
    return saved === "am" || saved === "en" ? saved : "en";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("birrstream_lang", newLang);
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "am" : "en");
  };

  const t = (key: string, fallback?: string): string => {
    return DICTIONARY[lang]?.[key] || fallback || DICTIONARY["en"]?.[key] || key;
  };

  const isAmharic = lang === "am";

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isAmharic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}