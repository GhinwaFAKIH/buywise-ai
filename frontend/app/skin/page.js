import {CategoryPage,catalog} from "../components/CategoryPage";
export const metadata={title:catalog.skin.title+" | BuyWise AI",description:catalog.skin.intro,alternates:{canonical:"/skin"}};
export default function Page(){return <CategoryPage category="skin"/>;}
