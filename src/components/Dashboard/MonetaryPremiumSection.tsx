import type { FC } from "react";
import BasicErrorBoundary from "../BasicErrorBoundary";
import Flippenings from "../Flippenings";
import IssuanceBreakdown from "../IssuanceBreakdown";
import PriceModel from "../PriceModel";
import ScarcityWidget from "../ScarcityWidget";
import SectionDivider from "../SectionDivider";
import ValidatorRewardsWidget from "../ValidatorRewards";

const MonetaryPremiumSection: FC = () => (
  <div className="xs:px-4 md:px-16" id="monetary-premium">
    <SectionDivider
      title="monetary premium"
      link="monetary-premium"
      subtitle="the race to become the most desirable money"
    />
    <BasicErrorBoundary>
      <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-x-4">
        <div className="flex flex-col basis-1/2 gap-y-4">
          <ScarcityWidget />
          <ValidatorRewardsWidget />
          <Flippenings />
        </div>
        <div className="basis-1/2 flex flex-col gap-y-4">
          <PriceModel />
          <IssuanceBreakdown />
        </div>
      </div>
    </BasicErrorBoundary>
  </div>
);

export default MonetaryPremiumSection;
