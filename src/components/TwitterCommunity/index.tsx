import * as React from "react";
import useSWR from "swr";
import Clipboard from "react-clipboard.js";
import TwitterProfile from "./TwitterProfile";
import SpanMoji from "../SpanMoji";
import { TranslationsContext } from "../../translations-context";

const TwitterCommunity: React.FC = () => {
  const t = React.useContext(TranslationsContext);
  const [isCopiedFeedbackVisible, setIsCopiedFeedbackVisible] = React.useState<
    boolean
  >(false);
  const { data } = useSWR(
    "https://api.ultrasound.money/fam/2/profiles",
    (url: string) => fetch(url).then((r) => r.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (!data) {
    return null;
  }

  const getFamCount = new Intl.NumberFormat().format(
    isNaN(data && data.count) ? 0 : data && data.count
  );

  const getText =
    getFamCount !== undefined
      ? t.title_community.replace("#XXX", getFamCount)
      : t.title_community;

  const onBatSoundCopied = () => {
    setIsCopiedFeedbackVisible(true);
    setTimeout(() => setIsCopiedFeedbackVisible(false), 400);
  };

  return (
    <>
      <h1 className="text-white font-light text-center text-2xl md:text-3xl xl:text-41xl mb-8">
        <a
          target="_blank"
          href="https://twitter.com/i/lists/1376636817089396750/members"
          rel="noopener noreferrer"
          role="link"
          title={t.title_community_hover}
          className="hover:underline hover:text-blue-spindle relative h-full"
        >
          {getText}
        </a>
      </h1>
      <div className="flex items-center">
        <p className="text-blue-shipcove md:text-lg">wear the bat signal</p>
        <div className="w-4"></div>
        <Clipboard data-clipboard-text={"🦇🔊"} onSuccess={onBatSoundCopied}>
          <span
            className={`bg-blue-midnightexpress border border-gray-700 rounded-full p-2 pl-5 flex w-48 mx-auto justify-between items-center text-2xl transition duration-500 ease-in-out isolate clipboard-emoji ${
              isCopiedFeedbackVisible ? "bg-gray-800" : ""
            }`}
          >
            <SpanMoji emoji="🦇🔊" />
            <span className="font-light text-base copy-container rounded-full bg-green-mediumspring text-blue-midnightexpress px-5 py-1 isolate">
              copy
            </span>
          </span>
        </Clipboard>
      </div>
      <div className="h-16"></div>
      <TwitterProfile profileList={data && data.profiles} />
    </>
  );
};

export default TwitterCommunity;
