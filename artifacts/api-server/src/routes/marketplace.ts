import { Router, type IRouter } from "express";
import {
  CreateListingBody,
  CreateTradeBody,
  GetListingParams,
  GetMarketplaceSummaryResponse,
  GetListingResponse,
  ListConversationsResponse,
  ListListingsQueryParams,
  ListListingsResponse,
  ListMessagesParams,
  ListMessagesResponse,
  ListPacksResponse,
  ListTradesResponse,
  SendMessageBody,
  SendMessageParams,
} from "@workspace/api-zod";

type Listing = {
  id: number;
  name: string;
  game: string;
  setName: string;
  rarity: string;
  condition: string;
  price: number;
  seller: string;
  image: string;
  listedAt: string;
  featured?: boolean;
  tradeable?: boolean;
};

const now = () => new Date().toISOString();

let listings: Listing[] = [
  {
    id: 1,
    name: "Charizard ex",
    game: "Pokemon",
    setName: "Obsidian Flames",
    rarity: "Special Illustration Rare",
    condition: "Near Mint",
    price: 4850,
    seller: "PokeNook",
    image: "https://images.pokemontcg.io/sv3/223_hires.png",
    listedAt: "เมื่อ 12 นาทีที่แล้ว",
    featured: true,
    tradeable: true,
  },
  {
    id: 2,
    name: "Monkey D. Luffy",
    game: "One Piece",
    setName: "500 Years in the Future",
    rarity: "Manga Rare",
    condition: "Near Mint",
    price: 12800,
    seller: "CardCaptain",
    image: "https://images.pokemontcg.io/sv3/223.png",
    listedAt: "เมื่อ 28 นาทีที่แล้ว",
    featured: true,
    tradeable: true,
  },
  {
    id: 3,
    name: "Pikachu VMAX",
    game: "Pokemon",
    setName: "Vivid Voltage",
    rarity: "Rainbow Rare",
    condition: "Excellent",
    price: 2190,
    seller: "MintCondition",
    image: "https://images.pokemontcg.io/swsh4/188_hires.png",
    listedAt: "เมื่อ 1 ชั่วโมงที่แล้ว",
    tradeable: false,
  },
  {
    id: 4,
    name: "Roronoa Zoro",
    game: "One Piece",
    setName: "Romance Dawn",
    rarity: "Alternate Art",
    condition: "Near Mint",
    price: 3790,
    seller: "EastBlue",
    image: "https://images.pokemontcg.io/swsh1/188_hires.png",
    listedAt: "เมื่อ 2 ชั่วโมงที่แล้ว",
    tradeable: true,
  },
  {
    id: 5,
    name: "Umbreon VMAX",
    game: "Pokemon",
    setName: "Evolving Skies",
    rarity: "Alternate Art",
    condition: "Near Mint",
    price: 8900,
    seller: "MoonBall",
    image: "https://images.pokemontcg.io/swsh7/215_hires.png",
    listedAt: "เมื่อ 3 ชั่วโมงที่แล้ว",
    tradeable: true,
  },
  {
    id: 6,
    name: "Trafalgar Law",
    game: "One Piece",
    setName: "Wings of the Captain",
    rarity: "Secret Rare",
    condition: "Excellent",
    price: 1650,
    seller: "GrandLine",
    image: "https://images.pokemontcg.io/swsh3/188_hires.png",
    listedAt: "เมื่อ 4 ชั่วโมงที่แล้ว",
    tradeable: true,
  },
];

const packs = [
  {
    id: 1,
    name: "Scarlet & Violet: Stellar Crown",
    game: "Pokemon",
    description: "สุ่ม 5 ใบ พร้อมโอกาสได้การ์ด Illustration Rare",
    price: 129,
    image: "https://images.pokemontcg.io/sv7/1_hires.png",
    cardsPerPack: 5,
    stock: 42,
    accent: "violet",
  },
  {
    id: 2,
    name: "One Piece: The Best Vol. 2",
    game: "One Piece",
    description: "สุ่ม 6 ใบจากชุดพิเศษ รวมการ์ดหายากและ Leader",
    price: 189,
    image: "https://images.pokemontcg.io/swsh9/1_hires.png",
    cardsPerPack: 6,
    stock: 28,
    accent: "red",
  },
  {
    id: 3,
    name: "Lucky Draw: Collector's Mix",
    game: "Mixed",
    description: "การ์ดคละซีรีส์ ลุ้นของแรร์ทุกซอง ไม่มีซ้ำในออเดอร์เดียว",
    price: 249,
    image: "https://images.pokemontcg.io/sv3/1_hires.png",
    cardsPerPack: 8,
    stock: 17,
    accent: "gold",
  },
];

let trades = [
  {
    id: 1,
    offeredCard: "Pikachu VMAX Rainbow",
    requestedCard: "Umbreon VMAX Alt Art",
    trader: "PikaTrade",
    status: "กำลังตามหา",
    createdAt: "วันนี้",
    image: "https://images.pokemontcg.io/swsh4/188_hires.png",
  },
  {
    id: 2,
    offeredCard: "Luffy OP05 Manga",
    requestedCard: "Zoro OP06 Alt Art",
    trader: "StrawHatTH",
    status: "ข้อเสนอใหม่",
    createdAt: "เมื่อ 18 นาทีที่แล้ว",
    image: "https://images.pokemontcg.io/swsh3/188_hires.png",
  },
];

const conversations = [
  {
    id: 1,
    participant: "PokeNook",
    listingName: "Charizard ex — Obsidian Flames",
    preview: "ถ้ารับวันนี้ลดเหลือ 4,500 ได้ครับ",
    updatedAt: "10:42",
    unread: 2,
    avatar: "PN",
  },
  {
    id: 2,
    participant: "CardCaptain",
    listingName: "Monkey D. Luffy — 500 Years",
    preview: "สนใจแลกกับการ์ดใบไหนบ้างครับ",
    updatedAt: "เมื่อวาน",
    unread: 0,
    avatar: "CC",
  },
];

const messages = new Map([
  [
    1,
    [
      {
        id: 1,
        conversationId: 1,
        text: "สวัสดีครับ สนใจ Charizard ใบนี้ครับ ลดได้อีกนิดไหมครับ",
        sender: "คุณ",
        sentAt: "10:38",
        mine: true,
      },
      {
        id: 2,
        conversationId: 1,
        text: "ถ้ารับวันนี้ลดเหลือ 4,500 ได้ครับ รวมส่งแบบกันกระแทกให้เลย",
        sender: "PokeNook",
        sentAt: "10:42",
        mine: false,
      },
    ],
  ],
  [
    2,
    [
      {
        id: 3,
        conversationId: 2,
        text: "สนใจแลกกับการ์ดใบไหนบ้างครับ",
        sender: "CardCaptain",
        sentAt: "เมื่อวาน",
        mine: false,
      },
    ],
  ],
]);

const router: IRouter = Router();

router.get("/marketplace/summary", (_req, res) => {
  const data = GetMarketplaceSummaryResponse.parse({
    activeListings: listings.length + 1248,
    tradesToday: 86,
    packsSold: 342,
    averagePrice: 1840,
  });
  res.json(data);
});

router.get("/marketplace/listings", (req, res) => {
  const query = ListListingsQueryParams.parse(req.query);
  let result = [...listings];
  if (query.game && query.game !== "ทั้งหมด") {
    result = result.filter((listing) => listing.game === query.game);
  }
  if (query.search) {
    const search = query.search.toLowerCase();
    result = result.filter((listing) =>
      `${listing.name} ${listing.setName} ${listing.rarity}`.toLowerCase().includes(search),
    );
  }
  if (query.sort === "ราคาต่ำสุด") result.sort((a, b) => a.price - b.price);
  if (query.sort === "ราคาแพงสุด") result.sort((a, b) => b.price - a.price);
  res.json(ListListingsResponse.parse(result));
});

router.post("/marketplace/listings", (req, res) => {
  const body = CreateListingBody.parse(req.body);
  const listing: Listing = {
    ...body,
    id: Math.max(...listings.map((item) => item.id), 0) + 1,
    seller: "คุณ",
    listedAt: "เมื่อสักครู่นี้",
  };
  listings = [listing, ...listings];
  res.status(201).json(listing);
});

router.get("/marketplace/listings/:id", (req, res) => {
  const { id } = GetListingParams.parse(req.params);
  const listing = listings.find((item) => item.id === id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  return res.json(GetListingResponse.parse(listing));
});

router.get("/marketplace/packs", (_req, res) => {
  res.json(ListPacksResponse.parse(packs));
});

router.get("/trades", (_req, res) => {
  res.json(ListTradesResponse.parse(trades));
});

router.post("/trades", (req, res) => {
  const body = CreateTradeBody.parse(req.body);
  const trade = {
    ...body,
    image: body.image ?? "",
    id: Math.max(...trades.map((item) => item.id), 0) + 1,
    trader: "คุณ",
    status: "รอการตอบรับ",
    createdAt: "เมื่อสักครู่นี้",
  };
  trades = [trade, ...trades];
  res.status(201).json(trade);
});

router.get("/conversations", (_req, res) => {
  res.json(ListConversationsResponse.parse(conversations));
});

router.get("/conversations/:id/messages", (req, res) => {
  const { id } = ListMessagesParams.parse(req.params);
  res.json(ListMessagesResponse.parse(messages.get(id) ?? []));
});

router.post("/conversations/:id/messages", (req, res) => {
  const { id } = SendMessageParams.parse(req.params);
  const body = SendMessageBody.parse(req.body);
  const conversationMessages = messages.get(id) ?? [];
  const message = {
    id: Math.max(...conversationMessages.map((item) => item.id), 0) + 1,
    conversationId: id,
    text: body.text,
    sender: "คุณ",
    sentAt: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    mine: true,
  };
  messages.set(id, [...conversationMessages, message]);
  res.status(201).json(message);
});

export default router;