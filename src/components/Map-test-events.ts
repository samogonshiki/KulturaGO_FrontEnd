import {
    Attraction,
    Event,
    PopularRoute,
    SearchPoint,
    Statistic,
    VisitedPlace,
} from "./constans";


export const statistics: Statistic = { cities: 4, places: 12, areaKm: 5.3 };

//евенты для карты(тест)

export const attractions: Attraction[] = [
    {
        id: 1,
        name: "Гостиный двор",
        type: "museum",
        coordinates: [64.538111, 40.509778],
        rating: 4.8,
        price: "Бесплатно",
        description: "Исторический памятник архитектуры XVIII века, символ Архангельска.",
    },
    {
        id: 2,
        name: "Северный морской музей",
        type: "museum",
        coordinates: [64.533987, 40.516768],
        rating: 4.6,
        price: "200₽",
        description: "Музей истории освоения Арктики и Северного морского пути.",
    },
    {
        id: 3,
        name: "Петровский парк",
        type: "park",
        coordinates: [64.537222, 40.514194],
        rating: 4.5,
        price: "Бесплатно",
        description: "Исторический парк с памятником Петру I и красивой набережной.",
    },
    {
        id: 4,
        name: "Свято-Троицкий собор",
        type: "church",
        coordinates: [64.563969, 40.529866],
        rating: 4.7,
        price: "Бесплатно",
        description: "Главный православный храм Архангельска, памятник архитектуры.",
    },
    {
        id: 5,
        name: "Драматический театр",
        type: "monument",
        coordinates: [64.536369, 40.515223],
        rating: 4.7,
        price: "От 500₽",
        description: "Архангельский театр драмы имени М.В. Ломоносова.",
    },
    {
        id: 6,
        name: "Музей освоения Арктики",
        type: "museum",
        coordinates: [64.533925, 40.522796],
        rating: 4.5,
        price: "300₽",
        description: "Коллекция произведений искусства, посвящённых Арктике.",
    },
    {
        id: 7,
        name: "Краеведческий музей",
        type: "museum",
        coordinates: [64.539115, 40.509573],
        rating: 4.8,
        price: "от 150₽",
        description: "Один из старейших музеев России, расположенный в Гостиных дворах XVII века.",
    },
];

//евенты для боковой панели(тест)

export const lastVisited: VisitedPlace[] = [
    {
        id: "1",
        name: "Хакатон от САФУ",
        address: "Набережная Северной Двины",
        type: "hackathons",
        icon: "hackathons",
    },
];


export const upcomingEvents: Event[] = [
    {
        id: "1",
        name: "Фестиваль уличной еды",
        date: "15 июня",
        location: "Петровский парк",
        type: "festival",
    },
    {
        id: "2",
        name: "Концерт классической музыки",
        date: "20 июня",
        location: "Драматический театр",
        type: "concert",
    },
];

export const popularRoutes: PopularRoute[] = [
    { id: "1", name: "Исторический центр",      distance: "2.5 км", time: "45 мин", rating: 4.8 },
    { id: "2", name: "Набережная Северной Двины", distance: "3.2 км", time: "1 час", rating: 4.9 },
];

//конст знач для модалки Откуда-Куда

export let routePoints: { from: SearchPoint; to: SearchPoint } = {
    from: { address: "" },
    to: { address: "" },
};

export const setRoutePoints = (
    upd:
        | { from: SearchPoint; to: SearchPoint }
        | ((prev: { from: SearchPoint; to: SearchPoint }) => {
        from: SearchPoint;
        to: SearchPoint;
    }),
) => {
    const next = typeof upd === "function" ? upd(routePoints) : upd;
    routePoints = next;
};

export const initialRoutePoints = {
    from: { address: "" } as SearchPoint,
    to:   { address: "" } as SearchPoint,
};