import Header from "@/components/blocks/Header";
import { H1, H2, P } from "@/components/ui/typography";

export default function Home() {
	return (
		<>
			<Header />
			<pre className=" min-h-[200vh] max-w-[100vw] overflow-x-hidden text-xs">{Array(200).fill(0).map((_, i) => i).map(e => "=".repeat(e) + ">").join("\n")}</pre>
		</>
	)
}
