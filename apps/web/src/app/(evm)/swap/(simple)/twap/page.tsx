import { Container } from "@sushiswap/ui";
import dynamic from "next/dynamic";
import { Providers } from "../providers";

const TWAPPanel = dynamic(
  () => import("src/ui/swap/twap").then((it) => it.TWAPPanel),
  { ssr: false }
);

export const metadata = {
  title: "SushiSwap",
};

export default function TwapPage() {
  return (
    <Providers>
      <Container maxWidth="lg" className="px-4">
        <TWAPPanel />
      </Container>
    </Providers>
  );
}
