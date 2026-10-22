import {CategoryPage,catalog} from "../components/CategoryPage";
export const metadata={title:catalog.makeup.title+" | BuyWise AI",description:catalog.makeup.intro,alternates:{canonical:"/makeup"}};
export default function Page(){return <CategoryPage category="makeup"/>;}
