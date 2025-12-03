import ModernHero from "@/components/sections/Home/ModernHero";
import Footer from "@/components/ui/layout/Footer";
import { SpacingClasses } from "@/utils/constants";
import { cn } from "@/utils/helpers";
import { NextPage } from "next";
import dynamic from "next/dynamic";
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col gap-3 md:gap-8">
      <ModernHero />
      <div className={cn(SpacingClasses.main)}>
        <ContinueWatching />
        <HomePageList />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
