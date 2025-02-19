import dynamic from "next/dynamic";
import Head from "next/head";
import type { FC } from "react";
import { useCallback } from "react";
import { useEffect, useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useBaseFeePerGas } from "../../api/base-fee-per-gas";
import { useEthPriceStats } from "../../api/eth-price-stats";
import colors from "../../colors";
import { WEI_PER_GWEI } from "../../eth-units";
import * as FeatureFlags from "../../feature-flags";
import { FeatureFlagsContext } from "../../feature-flags";
import { formatZeroDecimals } from "../../format";
import useAuthFromSection from "../../hooks/use-auth-from-section";
import { useTwitterAuthStatus } from "../../hooks/use-twitter-auth";
import type { TimeFrameNext } from "../../time-frames";
import { getNextTimeFrame } from "../../time-frames";
import BasicErrorBoundary from "../BasicErrorBoundary";
import PoapSection from "../FamPage/PoapSection";
import HeaderGlow from "../HeaderGlow";
import FaqBlock from "../Landing/faq";
import MainTitle from "../MainTitle";
import TopBar from "../TopBar";
import ContactSection from "./ContactSection";
import FamSection from "./FamSection";
import JoinDiscordSection from "./JoinDiscordSection";
import SupplySection from "./SupplySection";
import ConfettiGenerator from "confetti-js";
import { useSupplySinceMerge } from "../../api/supply-since-merge";
import { useMergeStatus } from "../../api/merge-status";

const AdminTools = dynamic(() => import("../AdminTools"), { ssr: false });
// We get hydration errors in production.
// It's hard to tell what component causes them due to minification.
// We stop SSR on all components, and slowly turn them back on one-by-one to see which cause hydration issues.
// On: MergeSection, JoinDiscordSection
// Off: SupplySection, BurnSection, MonetaryPremiumSection, FamSection, TotalValueSecuredSection.
const TotalValueSecuredSection = dynamic(
  () => import("./TotalValueSecuredSection"),
  { ssr: false },
);
const MonetaryPremiumSection = dynamic(
  () => import("./MonetaryPremiumSection"),
  { ssr: false },
);
const SupplyProjectionsSection = dynamic(
  () => import("./SupplyProjectionsSection"),
  { ssr: false },
);
const GasSection = dynamic(() => import("./GasSection"), {
  ssr: false,
});
// Likely culprit.
const BurnSection = dynamic(() => import("./BurnSection"), {
  ssr: false,
});

const useGasPriceTitle = (defaultTitle: string) => {
  const [gasTitle, setGasTitle] = useState<string>();
  const baseFeePerGas = useBaseFeePerGas();
  const ethPriceStats = useEthPriceStats();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      baseFeePerGas === undefined ||
      ethPriceStats === undefined
    ) {
      return undefined;
    }
    const gasFormatted = (baseFeePerGas.wei / WEI_PER_GWEI).toFixed(0);
    const newTitle = `${gasFormatted} Gwei | $${formatZeroDecimals(
      ethPriceStats.usd,
    )} ${defaultTitle}`;
    setGasTitle(newTitle);
  }, [baseFeePerGas, defaultTitle, ethPriceStats]);

  return gasTitle;
};

// By default a browser doesn't scroll to a section with a given ID matching the # in the URL.
const useScrollOnLoad = () => {
  const [authFromSection, setAuthFromSection] = useAuthFromSection();

  useEffect(() => {
    if (typeof window === undefined || typeof document === undefined) {
      return undefined;
    }

    if (authFromSection !== "empty") {
      document
        .querySelector(`#${authFromSection}`)
        ?.scrollIntoView({ behavior: "auto", block: "start" });
      setAuthFromSection("empty");
    }

    if (window.location.hash.length > 0) {
      document
        .querySelector(window.location.hash)
        ?.scrollIntoView({ behavior: "auto", block: "start" });
    }
    // The useAuthFromSection deps are missing intentionally here, we only want
    // this to run once on load. Because we disable the exhaustive deps linting
    // rule for this reason do check anything you add above doesn't need to be
    // in there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

// This is a component to avoid triggering a render on the whole Dashboard.
const GasPriceTitle = () => {
  const gasPriceTitle = useGasPriceTitle("| ultrasound.money");
  return (
    <Head>
      <title>{gasPriceTitle}</title>
    </Head>
  );
};

const confettiSettings = {
  target: "confetti-canvas",
  height: 1400,
  props: [{ type: "svg", src: "/bat-own.svg" }],
};

type UseConfetti = { showConfetti: boolean };

const useConfetti = (): UseConfetti => {
  const [confettiRan, setConfettiRan] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const supplySinceMerge = useSupplySinceMerge();
  const mergeStatus = useMergeStatus();

  useEffect(() => {
    if (
      confettiRan ||
      supplySinceMerge === undefined ||
      typeof document === "undefined"
    ) {
      return;
    }

    // If confetti hasn't ran and last supply is under merge supply, run
    const lastSupply =
      supplySinceMerge.supply_by_hour[
        supplySinceMerge.supply_by_hour.length - 1
      ].supply;

    if (lastSupply > mergeStatus.supply) {
      return;
    }

    setShowConfetti(true);
    setConfettiRan(true);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const confetti = new ConfettiGenerator(confettiSettings) as {
      render: () => void;
      clear: () => void;
    };
    confetti.render();

    setTimeout(() => {
      confetti.clear();
    }, 15000);

    return;
  }, [mergeStatus, confettiRan, supplySinceMerge]);

  return { showConfetti };
};

const Dashboard: FC = () => {
  const { featureFlags, setFlag } = FeatureFlags.useFeatureFlags();
  const [twitterAuthStatus, setTwitterAuthStatus] = useTwitterAuthStatus();
  const [timeFrame, setTimeFrame] = useState<TimeFrameNext>("d1");
  useScrollOnLoad();

  const handleClickTimeFrame = useCallback(() => {
    setTimeFrame((timeFrame) => getNextTimeFrame(timeFrame));
  }, []);

  const handleSetTimeFrame = useCallback(setTimeFrame, [setTimeFrame]);

  const { showConfetti } = useConfetti();

  return (
    <FeatureFlagsContext.Provider value={featureFlags}>
      <SkeletonTheme
        baseColor={colors.slateus500}
        highlightColor="#565b7f"
        enableAnimation={true}
      >
        <canvas
          className={`pointer-events-none absolute z-10 ${
            showConfetti ? "" : "hidden"
          }`}
          id="confetti-canvas"
        ></canvas>
        <GasPriceTitle />
        <HeaderGlow />
        <div className="container mx-auto">
          <BasicErrorBoundary>
            <AdminTools setFlag={setFlag} />
          </BasicErrorBoundary>
          <div className="px-4 md:px-16">
            <BasicErrorBoundary>
              <TopBar />
            </BasicErrorBoundary>
          </div>
          <MainTitle>ultra sound money</MainTitle>
          <SupplySection
            timeFrame={timeFrame}
            onSetTimeFrame={handleSetTimeFrame}
            onClickTimeFrame={handleClickTimeFrame}
          />
          <GasSection
            timeFrame={timeFrame}
            onClickTimeFrame={handleClickTimeFrame}
          />
          <SupplyProjectionsSection />
          <div className="h-16"></div>
          <BurnSection />
          <div className="h-16"></div>
          <TotalValueSecuredSection />
          <div className="h-16"></div>
          <MonetaryPremiumSection />
          <FamSection />
          <PoapSection
            setTwitterAuthStatus={setTwitterAuthStatus}
            twitterAuthStatus={twitterAuthStatus}
          />
          <JoinDiscordSection
            setTwitterAuthStatus={setTwitterAuthStatus}
            twitterAuthStatus={twitterAuthStatus}
          />
          <div className="mt-32 flex px-4 md:px-0">
            <div className="relative w-full md:m-auto lg:w-2/3">
              <FaqBlock />
            </div>
          </div>
          <ContactSection />
        </div>
      </SkeletonTheme>
    </FeatureFlagsContext.Provider>
  );
};

export default Dashboard;
