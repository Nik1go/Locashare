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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
require("dotenv/config");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var existingUser, user1, user2, toolsData, _i, toolsData_1, t, tool;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.user.findFirst()];
                case 1:
                    existingUser = _a.sent();
                    if (existingUser) {
                        console.log("⚠️ La base de données contient déjà des données !");
                        return [2 /*return*/];
                    }
                    console.log('🌱 Démarrage du seeding...');
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Alice Dubois',
                                email: 'alice@example.com',
                            },
                        })];
                case 2:
                    user1 = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Marc Lefevre',
                                email: 'marc@example.com',
                            },
                        })];
                case 3:
                    user2 = _a.sent();
                    console.log("\u2705 Utilisateurs cr\u00E9\u00E9s : ".concat(user1.name, ", ").concat(user2.name));
                    toolsData = [
                        {
                            title: 'Perceuse sans fil Dewalt',
                            description: 'Perceuse visseuse 18V avec 2 batteries. Idéale pour tous types de petits travaux.',
                            pricePerDay: 15.0,
                            category: 'Bricolage',
                            location: 'Paris 11e',
                            imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop',
                            ownerId: user1.id,
                        },
                        {
                            title: 'Tondeuse à gazon électrique',
                            description: 'Tondeuse puissante et silencieuse pour jardins de taille moyenne (jusqu\'à 500m2).',
                            pricePerDay: 25.0,
                            category: 'Jardinage',
                            location: 'Lyon',
                            imageUrl: 'https://images.unsplash.com/photo-1592424006249-f00e120d5889?q=80&w=800&auto=format&fit=crop',
                            ownerId: user2.id,
                        },
                        {
                            title: 'Scie circulaire',
                            description: 'Scie circulaire filaire 1200W, précise, lame bois incluse.',
                            pricePerDay: 20.0,
                            category: 'Bricolage',
                            location: 'Paris 15e',
                            imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=800&auto=format&fit=crop',
                            ownerId: user1.id,
                        },
                        {
                            title: 'Nettoyeur haute pression (Kärcher)',
                            description: 'Nettoyeur 130 bars, parfait pour terrasses, murs et véhicules.',
                            pricePerDay: 30.0,
                            category: 'Nettoyage',
                            location: 'Marseille',
                            imageUrl: 'https://images.unsplash.com/photo-1621217036495-97fcbb9dfcb5?q=80&w=800&auto=format&fit=crop',
                            ownerId: user2.id,
                        },
                        {
                            title: 'Échelle télescopique 3m',
                            description: 'Échelle en aluminium, très légère et super compacte à transporter.',
                            pricePerDay: 10.0,
                            category: 'Bricolage',
                            location: 'Bordeaux',
                            imageUrl: 'https://images.unsplash.com/photo-1518557973614-72bef208df0c?q=80&w=800&auto=format&fit=crop',
                            ownerId: user1.id,
                        }
                    ];
                    _i = 0, toolsData_1 = toolsData;
                    _a.label = 4;
                case 4:
                    if (!(_i < toolsData_1.length)) return [3 /*break*/, 7];
                    t = toolsData_1[_i];
                    return [4 /*yield*/, prisma.tool.create({
                            data: t,
                        })];
                case 5:
                    tool = _a.sent();
                    console.log("\u2705 Outil cr\u00E9\u00E9 : ".concat(tool.title));
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    console.log('🎉 Seeding terminé avec succès.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
