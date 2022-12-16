"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// web server
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var path_1 = __importDefault(require("path"));
var app = (0, express_1.default)();
var port = '80';
// discord bot implementation
var discord_js_1 = require("discord.js");
var config_json_1 = require("./config.json");
var client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_PRESENCES
    ]
});
// misc
var fs_1 = __importDefault(require("fs"));
var oldStatus;
var oldPlatform;
// saving wars
var abusedServer;
var clientUser;
var userList = new Array();
// working vars
var userStatus = '';
var userPlatform = '';
var profileBannerFormat;
var profileBannerHeight;
var statusIcon;
var resData;
client.once('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // WebServer Settings
        app.use(express_1.default.urlencoded({ extended: false })); // configure the app to parse requests with urlencoded payloads
        app.use(express_1.default.json()); // configure the app to parse requests with JSON payloads
        app.use(body_parser_1.default.text()); // configure the app to be able to read text
        app.use(express_1.default.static('static'));
        app.listen(port, function () {
            console.log("App listening at http://localhost:".concat(port, "/"));
        });
        /* Handle GET Requests */
        app.get('/', function (req, res) {
            res.sendFile(path_1.default.join(__dirname + '/index.html')); // Send the index.html file
        });
        app.get('/contact', function (req, res) {
            res.sendFile(path_1.default.join(__dirname + '/contact.html')); // Send the contact.html file
        });
        /* Handle POST Requests */
        app.post('/getStatus', function (req, res) {
            if (resData != null) {
                res.status(200).send(resData);
            }
            else {
                //console.log("Error requesting new Status") // Log the error in the console
                res.sendStatus(500); // Send a 500 error.
            }
        });
        app.post('/setUser', function (req, res) {
            var userId = req.body.userId;
            var idCheck = checkId(userId);
            if (idCheck.flag) {
                clientUser = client.users.cache.find(function (user) { return user.id === userId; });
                getStatus();
                console.log("[Info] Started watching " + clientUser.username);
                res.redirect("/");
            }
            else {
                res.json(idCheck.message);
            }
        });
        abusedServer = client.guilds.fetch(config_json_1.serverId);
        abusedServer.then(function (resultGuild) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                resultGuild.members.cache.forEach(function (member) {
                    userList.push(member.id);
                });
                return [2 /*return*/];
            });
        }); });
        console.log("Ready to watch");
        return [2 /*return*/];
    });
}); });
function getStatus() {
    var _this = this;
    // resetting old values
    resData = {
        username: '',
        discriminator: '',
        profileBanner: '',
        profileBannerHeight: '',
        profileBannerAccentColor: '',
        profileImage: '',
        imageMargin: '',
        userStatus: '',
        platform: '',
        statusIcon: '',
    };
    // refreshing data on webpage 
    abusedServer.then(function (result1) {
        result1.members.fetch(clientUser.id).then(function (result) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, result.user.fetch()];
                    case 1:
                        _a.sent();
                        if (result.presence != null) {
                            userStatus = result.presence.status;
                            userPlatform = JSON.stringify(result.presence.clientStatus).substring(2, JSON.stringify(result.presence.clientStatus).indexOf('"', 2));
                        }
                        else {
                            userStatus = 'offline';
                            userPlatform = '';
                        }
                        if (result.user.banner != null) {
                            profileBannerFormat = result.user.banner.startsWith('a_') ? 'gif' : 'png';
                        }
                        profileBannerHeight = result.user.banner ? '240' : '120';
                        if (userStatus != 'offline') {
                            statusIcon = '/statusIcons/' + userStatus + userPlatform + '.png';
                        }
                        else {
                            statusIcon = '/statusIcons/' + 'offline.png';
                        }
                        resData = {
                            username: result.user.username,
                            discriminator: result.user.discriminator,
                            profileBanner: result.user.bannerURL({ dynamic: true, size: 600, format: profileBannerFormat }),
                            profileBannerHeight: profileBannerHeight,
                            profileBannerAccentColor: result.user.hexAccentColor,
                            profileImage: result.displayAvatarURL({ dynamic: true, size: 128 }),
                            imageMargin: result.user.banner ? '179' : '56',
                            userStatus: userStatus,
                            platform: userPlatform,
                            statusIcon: statusIcon,
                        };
                        //statusmessage: result.presence.activities[0].state,                      
                        if (result.presence != null) {
                            oldStatus = result.presence.status;
                        }
                        else if (result.presence == null) {
                            oldStatus = 'offline';
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    });
}
function checkId(Id) {
    var returnObj;
    if (Id.length === 18) {
        userList.forEach(function (id) {
            if (Id === id) {
                returnObj = {
                    flag: true
                };
            }
        });
        if (returnObj == null) {
            returnObj = {
                flag: false,
                message: "Id could not be found on selected Server ()"
            };
        }
    }
    else {
        returnObj = {
            flag: false,
            message: "Id length invalid (should be 18)"
        };
    }
    return returnObj;
}
client.on('presenceUpdate', function (oldPresence, newPresence) {
    var day = new Date();
    // time in following format: day/month/year at hour:minute:second
    var time = "".concat(String(day.getDate()).padStart(2, '0'), "/").concat(String(day.getMonth() + 1).padStart(2, '0'), "/").concat(String(day.getFullYear()).padStart(2, '0'), " at ").concat(String(day.getHours()).padStart(2, '0'), ":").concat(String(day.getMinutes()).padStart(2, '0'), ":").concat(String(day.getSeconds()).padStart(2, '0'));
    var platform = '';
    if (newPresence != null) {
        // get platform
        switch (JSON.stringify(newPresence.member.presence.clientStatus).substring(2, JSON.stringify(newPresence.member.presence.clientStatus).indexOf('"', 2))) {
            case 'desktop':
                platform = '[D]';
                break;
            case 'mobile':
                platform = '[M]';
                break;
            case 'web':
                platform = '[W]';
                break;
            case 'bot':
                platform = '[B]';
                break;
            default:
                platform = '[-]';
                break;
        }
        if (clientUser != undefined && newPresence.user.id === clientUser.id) {
            getStatus();
            if (oldStatus !== newPresence.member.presence.status) {
                // write to log
                fs_1.default.writeFile("./logs/".concat(clientUser.username, ".txt"), "".concat(time, " ").concat(platform, " ").concat(newPresence.member.presence.status, "\n"), { flag: 'a' }, function (err) {
                    // throwing an error if the status couldn't be logged
                    if (err)
                        throw err;
                });
                oldStatus = newPresence.member.presence.status;
                oldPlatform = platform;
            }
            else if (oldPlatform !== platform) {
                fs_1.default.writeFile("./logs/".concat(clientUser.username, ".txt"), "".concat(time, " ").concat(platform, " ").concat(oldStatus, "\n"), { flag: 'a' }, function (err) {
                    // throwing an error if the status couldn't be logged
                    if (err)
                        throw err;
                });
                oldPlatform = platform;
            }
        }
    }
    else {
        oldStatus = 'offline';
    }
});
client.login(config_json_1.token);
