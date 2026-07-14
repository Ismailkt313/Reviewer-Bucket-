import Header from "./components/Header";
import ReviewerExplorer from "./components/ReviewerExplorer";
import HowItWorks from "./components/HowItWorks";
import About from "./components/About";
import FAQ from "./components/FAQ";
import Disclaimer from "./components/Disclaimer";
import Footer from "./components/Footer";
import { reviewers } from "./data/reviewers";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ReviewerExplorer reviewers={reviewers} />
        <HowItWorks />
        <About />
        <FAQ />
        <Disclaimer />
      </main>
      <Footer />
    </>
  );
}
