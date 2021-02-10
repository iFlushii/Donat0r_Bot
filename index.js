const fs = require("fs");
const config = require("./config.json");
const phrases = require("./phrases.json");
const { Telegraf } = require("telegraf");
const { Keyboard } = require("telegram-keyboard");
const MaskData = require("maskdata");
let db = require("quick.db");
let users = new db.table("users");
let aQiwi = require("node-qiwi-api").asyncApi;
let qiwiWallet = new aQiwi(config.QIWI_ACCESS_TOKEN);
let latest_transaction = Number(fs.readFileSync("./latest_transaction", "utf8"));

async function get_worker(comment){
	let valid_payment = /^donat0r_[0-9]{1,}_[0-9]{1,}$/;
	if(!valid_payment.test(comment))return "Не определен";
	let mammothId = comment.split("_")[1];
	let mammoth = users.get(mammothId);
	if(!mammoth)return "Не определен";
	if(!mammoth.referer)return "Не определен";
	if(!mammoth.get(mammoth.referer))return "Не определен";
	let worker = await bot.telegram.getChat(mammoth.referer);
	return (worker.username ? "@" + worker.username : worker.first_name);
}
			

setInterval(async() => {
	let payments = await qiwiWallet.getOperationHistory(config.QIWI_NUMBER, {
		rows: 50,
		operation: "IN"
	});
	let newPayments = payments.data.filter(payment => 
		payment.txnId > latest_transaction)
	.sort((payment1, payment2) => 
		payment1.txnId - payment2.txnId);
	for(let payment of newPayments){
		let worker = await get_worker(payment.comment);
		bot.telegram.sendMessage(Number(config.CHAT_ID), phrases.PAYMENT_RECEIVED
			.replace("{{AMOUNT}}", payment.total.amount)
			.replace("{{WALLET}}", MaskData.maskPhone(payment.account))
			.replace("{{WORKER}}", worker));
	}
	if(newPayments.length){
		latest_transaction = newPayments[newPayments.length - 1].txnId;
		fs.writeFileSync("./latest_transaction", latest_transaction.toString());
	}
}, 10000);

const bot = new Telegraf(config.BOT_TOKEN);

bot.start((ctx) => {
	let user_id = ctx.message.from.id.toString();
	let user = users.get(user_id);
	if (!user) {
		user = {
			referrals: 0,
			referer: null,
			state: "MAIN_MENU"
		};
		users.set(user_id, user);
	}
	function processReferer(){
		let referer = ctx.startPayload;
		if(!referer || user.referer || !users.get(referer) || referer == user_id)return;
		users.set([user_id, "referer"].join("."), referer);
		let referer_u = users.get(referer);
		referer_u.referrals += 1;
		users.set(referer, referer_u);
	}
	processReferer();
	const keyboard = Keyboard.make([
		["Игры 🎮"],
		["Почему дешево?🔮", "Отзывы 🛎"],
		["Реф. система 💰", "Тех. Поддержка ⚙️"]
	]);
	ctx.reply(phrases.START, keyboard.reply());
});



bot.hears("Игры 🎮", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "MAIN_MENU")return;
	user.state = "GAME_SELECT";
	users.set(user_id, user);
	const keyboard = Keyboard.make([
		["⭐️ Pubg Mobile", "⭐️ Brawl Stars"],
		["⭐️ Roblox", "⭐️ Free Fire"],
		["⭐️ Standoff 2", "⭐️ Clash Royale"],
		["❌ Отмена ❌"]
	]);
	ctx.reply(phrases.SELECT_GAME, keyboard.reply());
});

bot.hears("⭐️ Pubg Mobile", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "GAME_SELECT")return;
	user.state = "GAME_SELECT|PUBG_MOBILE";
	users.set(user_id, user);
	const keyboard = Keyboard.make([
		["Купить! 💳"],
		["Цены ✨"],
		["❌ Отмена ❌"]
	]);
	ctx.reply(phrases.YOU_SELECTED_GAME
		.replace("{{GAME_NAME}}", "⭐️ Pubg Mobile"), 
	keyboard.reply());
});

bot.hears("⭐️ Brawl Stars", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "GAME_SELECT")return;
	user.state = "GAME_SELECT|BRAWL_STARS";
	users.set(user_id, user);
	const keyboard = Keyboard.make([
		["Купить! 💳"],
		["Цены ✨"],
		["❌ Отмена ❌"]
	]);
	ctx.reply(phrases.YOU_SELECTED_GAME
		.replace("{{GAME_NAME}}", "⭐️ Brawl Stars"), 
	keyboard.reply());
});

bot.hears("⭐️ Roblox", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "GAME_SELECT")return;
	user.state = "GAME_SELECT|ROBLOX";
	users.set(user_id, user);
	const keyboard = Keyboard.make([
		["Купить! 💳"],
		["Цены ✨"],
		["❌ Отмена ❌"]
	]);
	ctx.reply(phrases.YOU_SELECTED_GAME
		.replace("{{GAME_NAME}}", "⭐️ Roblox"), 
	keyboard.reply());
});

bot.hears("⭐️ Free Fire", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "GAME_SELECT")return;
	user.state = "GAME_SELECT|FREE_FIRE";
	users.set(user_id, user);
	const keyboard = Keyboard.make([
		["Купить! 💳"],
		["Цены ✨"],
		["❌ Отмена ❌"]
	]);
	ctx.reply(phrases.YOU_SELECTED_GAME
		.replace("{{GAME_NAME}}", "⭐️ Free Fire"), 
	keyboard.reply());
});

bot.hears("⭐️ Standoff 2", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "GAME_SELECT")return;
	user.state = "GAME_SELECT|STANDOFF_2";
	users.set(user_id, user);
	const keyboard = Keyboard.make([
		["Купить! 💳"],
		["Цены ✨"],
		["❌ Отмена ❌"]
	]);
	ctx.reply(phrases.YOU_SELECTED_GAME
		.replace("{{GAME_NAME}}", "⭐️ Standoff 2"), 
	keyboard.reply());
});

bot.hears("⭐️ Clash Royale", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "GAME_SELECT")return;
	user.state = "GAME_SELECT|CLASH_ROYALE";
	users.set(user_id, user);
	const keyboard = Keyboard.make([
		["Купить! 💳"],
		["Цены ✨"],
		["❌ Отмена ❌"]
	]);
	ctx.reply(phrases.YOU_SELECTED_GAME
		.replace("{{GAME_NAME}}", "⭐️ Clash Royale"), 
	keyboard.reply());
});

bot.hears("Цены ✨", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(!user.state.startsWith("GAME_SELECT|"))return;
	ctx.reply(phrases["PRICES_"+user.state.slice("GAME_SELECT|".length)]);
});

bot.hears("Купить! 💳", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(!user.state.startsWith("GAME_SELECT|"))return;
	const keyboard = Keyboard.make([
		["❌ Отмена ❌"]
	]);
	switch(user.state){
		case "GAME_SELECT|PUBG_MOBILE":
			ctx.reply(phrases.SELECT_YOUR_ID, keyboard.reply());
			user.state = "ACCOUNT_INFO|PUBG_MOBILE";
			users.set(user_id, user);
			break;
		case "GAME_SELECT|BRAWL_STARS":
			ctx.reply(phrases.SELECT_YOUR_ID, keyboard.reply());
			user.state = "ACCOUNT_INFO|BRAWL_STARS";
			users.set(user_id, user);
			break;
		case "GAME_SELECT|ROBLOX":
			ctx.reply(phrases.SELECT_YOUR_USERNAME_ROBLOX, keyboard.reply());
			user.state = "ACCOUNT_INFO|ROBLOX";
			users.set(user_id, user);
			break;
		case "GAME_SELECT|FREE_FIRE":
			ctx.reply(phrases.SELECT_YOUR_ID, keyboard.reply())
			user.state = "ACCOUNT_INFO|FREE_FIRE";
			users.set(user_id, user);
			break;
		case "GAME_SELECT|STANDOFF_2":
			ctx.reply(phrases.SELECT_YOUR_ID_STANDOFF_2, keyboard.reply());
			user.state = "ACCOUNT_INFO|STANDOFF_2";
			users.set(user_id, user);
			break;
		case "GAME_SELECT|CLASH_ROYALE":
			ctx.reply(phrases.SELECT_YOUR_ID, keyboard.reply());
			user.state = "ACCOUNT_INFO|CLASH_ROYALE";
			users.set(user_id, user);
			break;
	}
});

bot.hears("Почему дешево?🔮", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "MAIN_MENU")return;
	ctx.reply(phrases.LOW_PRICES_REASON);
});

bot.hears("Отзывы 🛎", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "MAIN_MENU")return;
	ctx.reply(phrases.REVIEWS_INFO
		.replace("{{REVIEWS_CHANNEL}}", config.REVIEWS_CHANNEL));
});

bot.hears("Реф. система 💰", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "MAIN_MENU")return;
	ctx.reply(phrases.REFERRAL_SYSTEM
		.replace("{{REFERRAL_MULTIPLIER}}", config.REFERRAL_MULTIPLIER)
		.replace("{{REFERRAL_LINK}}", "https://t.me/"+config.BOT_USERNAME+"?start="+user_id)
		.replace("{{REFERRALS_COUNT}}", user.referrals)
		.replace("{{DEPOSIT_BONUS}}", user.referrals * config.REFERRAL_MULTIPLIER));
});

bot.hears("Тех. Поддержка ⚙️", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "MAIN_MENU")return;
	ctx.reply(phrases.TECH_SUPPORT_CONTACTS
		.replace("{{SUPPORT}}", config.SUPPORT));
});

bot.hears("❌ Отмена ❌", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	user.state = "MAIN_MENU";
	users.set(user_id, user);
	const keyboard = Keyboard.make([
		["Игры 🎮"],
		["Почему дешево?🔮", "Отзывы 🛎"],
		["Реф. система 💰", "Тех. Поддержка ⚙️"]
	]);
	ctx.reply(phrases.ORDER_CANCELLED, keyboard.reply());
});

function generatePayment(ctx, amount){
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	user.state = "IN_PAYMENT";
	users.set(user_id, user);
	const keyboard = Keyboard.make([
		["Проверить оплату 💎"],
		["❌ Отмена ❌"]
	]);
	let comment = "donat0r_"+ctx.from.id.toString()+"_"+Math.floor(Math.random() * 10000);
	ctx.replyWithMarkdown(phrases.PAYMENT_MESSAGE
		.replace("{{AMOUNT}}", amount)
		.replace("{{PAYMENT_NICKNAME}}", config.PAYMENT_NICKNAME)
		.replace("{{PAYMENT_COMMENT}}", comment), keyboard.reply());
}

bot.hears("Проверить оплату 💎", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "IN_PAYMENT")return;
	ctx.reply(phrases.NO_PAYMENT_RECEIVED);
});

bot.hears("600(+ 90)UC - 300 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|PUBG_MOBILE")return;
	generatePayment(ctx, 300);
});

bot.hears("1500(+ 375)UC - 500 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|PUBG_MOBILE")return;
	generatePayment(ctx, 500);
});

bot.hears("3000(+ 1000)UC - 1000 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|PUBG_MOBILE")return;
	generatePayment(ctx, 1000);
});

bot.hears("6000(+ 2400)UC - 2000 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|PUBG_MOBILE")return;
	generatePayment(ctx, 2000);
});

bot.hears("100 гемов - 200 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|BRAWL_STARS")return;
	generatePayment(ctx, 200);
});

bot.hears("200 гемов - 350 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|BRAWL_STARS")return;
	generatePayment(ctx, 350);
});

bot.hears("500 гемов - 600 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|BRAWL_STARS")return;
	generatePayment(ctx, 600);
});

bot.hears("1000 гемов - 1000 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|BRAWL_STARS")return;
	generatePayment(ctx, 1000);
});

bot.hears("1080 алмазов - 300 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|FREE_FIRE")return;
	generatePayment(ctx, 300);
});

bot.hears("2200 алмазов - 500 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|FREE_FIRE")return;
	generatePayment(ctx, 500);
});

bot.hears("4450 алмазов - 1000 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|FREE_FIRE")return;
	generatePayment(ctx, 1000);
});

bot.hears("6950 алмазов - 1500 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|FREE_FIRE")return;
	generatePayment(ctx, 1500);
});

bot.hears("500 гемов - 200 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|CLASH_ROYALE")return;
	generatePayment(ctx, 200);
});

bot.hears("1000 гемов - 350 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|CLASH_ROYALE")return;
	generatePayment(ctx, 350);
});

bot.hears("2000 гемов - 600 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|CLASH_ROYALE")return;
	generatePayment(ctx, 600);
});

bot.hears("3000 гемов - 1000 Рублей.", (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state != "SELECT_AMOUNT|CLASH_ROYALE")return;
	generatePayment(ctx, 1000);
});

bot.hears(/.*/giu, (ctx) => {
	let user_id = ctx.from.id.toString();
	let user = users.get(user_id);
	if(user.state == "MAIN_MENU")return;
	if(user.state == "GAME_SELECT")return ctx.reply(phrases.SELECT_GAME_FROM_LIST);
	if(user.state.startsWith("GAME_SELECT|"))return ctx.reply(phrases.SELECT_BUTTON);
	if(user.state == "IN_PAYMENT")return ctx.reply(phrases.PAY_OR_CANCEL);
	if(user.state.startsWith("SELECT_AMOUNT|")){
		if(user.state == "SELECT_AMOUNT|ROBLOX" || user.state == "SELECT_AMOUNT|STANDOFF_2"){
			let amount = ctx.update.message.text;
			let game = user.state.slice("SELECT_AMOUNT|".length);
			if(!/^\d+$/giu.test(amount)){
				ctx.reply(phrases["INVALID_AMOUNT_"+game]);
				return;
			}
			amount = parseInt(amount);
			let limits = {
				"ROBLOX": [500, 12500],
				"STANDOFF_2": [125, 25000]
			};
			let coef = {
				"ROBLOX": 0.2,
				"STANDOFF_2": 0.5
			}
			let min = limits[game][0], max = limits[game][1];
			if(!(min <= amount && amount <= max)){
				ctx.reply(phrases["INVALID_AMOUNT_"+game]);
				return;
			}
			generatePayment(ctx, amount * coef[game]);
		}else{
			ctx.reply(phrases.SELECT_PACK);
		}
		return;
	}
	const regexes = {
		"PUBG_MOBILE": /^[0-9]{5,12}$/giu,
		"BRAWL_STARS": /^[0-9a-zA-Z]{5,15}$/giu,
		"ROBLOX": /^[\w0-9a-zA-Zа-яА-Я]{5,15}$/giu,
		"FREE_FIRE": /^[0-9]{5,12}$/giu,
		"STANDOFF_2": /^[0-9]{5,12}$/giu,
		"CLASH_ROYALE": /^[0-9a-zA-Z]{5,15}$/giu
	};
	let nickname = ctx.update.message.text;
	if(!regexes[user.state.slice("ACCOUNT_INFO|".length)].test(nickname)){
		switch(user.state.slice("ACCOUNT_INFO|".length)){
			case "PUBG_MOBILE":
				ctx.reply(phrases.WRONG_ID);
				break;
			case "BRAWL_STARS":
				ctx.reply(phrases.WRONG_ID);
				break;
			case "ROBLOX":
				ctx.reply(phrases.WRONG_NICKNAME);
				break;
			case "FREE_FIRE":
				ctx.reply(phrases.WRONG_ID);
				break;
			case "STANDOFF_2":
				ctx.reply(phrases.WRONG_ID);
				break;
			case "CLASH_ROYALE":
				ctx.reply(phrases.WRONG_ID);
				break;
		}
	} else {
		switch(user.state.slice("ACCOUNT_INFO|".length)){
			case "PUBG_MOBILE":
				ctx.reply(phrases.PUBG_MOBILE_SELECT_AMOUNT, Keyboard.make([
					["600(+ 90)UC - 300 Рублей.", "1500(+ 375)UC - 500 Рублей."],
					["3000(+ 1000)UC - 1000 Рублей.", "6000(+ 2400)UC - 2000 Рублей."],
					["❌ Отмена ❌"]
				]).reply());
				user.state = "SELECT_AMOUNT|PUBG_MOBILE";
				users.set(user_id, user);
				break;
			case "BRAWL_STARS":
				ctx.reply(phrases.BRAWL_STARS_SELECT_AMOUNT, Keyboard.make([
					["100 гемов - 200 Рублей.", "200 гемов - 350 Рублей."],
					["500 гемов - 600 Рублей.", "1000 гемов - 1000 Рублей."],
					["❌ Отмена ❌"]
				]).reply());
				user.state = "SELECT_AMOUNT|BRAWL_STARS";
				users.set(user_id, user);
				break;
			case "ROBLOX":
				ctx.reply(phrases.ROBLOX_SELECT_AMOUNT, Keyboard.make([
					["❌ Отмена ❌"]
				]).reply());
				user.state = "SELECT_AMOUNT|ROBLOX";
				users.set(user_id, user);
				break;
			case "FREE_FIRE":
				ctx.reply(phrases.FREE_FIRE_SELECT_AMOUNT, Keyboard.make([
					["1080 алмазов - 300 Рублей.", "2200 алмазов - 500 Рублей."],
					["4450 алмазов - 1000 Рублей.", "6950 алмазов - 1500 Рублей."],
					["❌ Отмена ❌"]
				]).reply());
				user.state = "SELECT_AMOUNT|FREE_FIRE";
				users.set(user_id, user);
				break;
			case "STANDOFF_2":
				ctx.reply(phrases.STANDOFF_2_SELECT_AMOUNT, Keyboard.make([
					["❌ Отмена ❌"]
				]).reply());
				user.state = "SELECT_AMOUNT|STANDOFF_2";
				users.set(user_id, user);
				break;
			case "CLASH_ROYALE":
				ctx.reply(phrases.CLASH_ROYALE_SELECT_AMOUNT, Keyboard.make([
					["500 гемов - 200 Рублей.", "1000 гемов - 350 Рублей."],
					["2000 гемов - 600 Рублей.", "3000 гемов - 1000 Рублей."],
					["❌ Отмена ❌"]
				]).reply());
				user.state = "SELECT_AMOUNT|CLASH_ROYALE";
				users.set(user_id, user);
				break;
		}
	}
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
