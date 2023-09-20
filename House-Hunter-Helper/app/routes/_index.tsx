import type { MetaFunction } from "@remix-run/node";
import { UserCircle2 } from "lucide-react";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Form, Link } from "@remix-run/react";
import { useState } from "react";
import { ActionFunctionArgs, redirect } from "@remix-run/node";


export const meta: MetaFunction = () => {
	return [
		{ title: "House Hunter Helper" },
		{
			name: "Helping you find homes and stay organized during your hunt.",
			content: "Start House Hunting Here!",
		},
	];
};

export default function Index() {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<div className="relative overflow-hidden">
			<div className="blur-md w-screen h-screen bg-no-repeat bg-cover bg-center bg-fixed bg-mainimage"></div>
			<div className="bg-black bg-opacity-20 absolute w-screen top-0 left-0 h-screen z-10">
				<div className="flex justify-between p-7 w-screen">
					<div>
						<h1 className="text-2xl text-maintext font-bold">
							House Hunter Helper
						</h1>
					</div>
					<UserCircle2 size={40} color="white" />
				</div>
				<div className="h-full flex justify-center items-center">
					<Form method="post" action="/search">
						<div className="flex flex-col justify-center items-center">
							<div className="flex items-center space-x-3">
								<Input
									type="text"
									variant="flat"
									label="Search"
									radius="lg"
									className="shadow-inner w-[20dvw]"
									name="search"
								/>
								<Link
									prefetch="intent"
									to="/advanced-search"
									className="underline text-blue-600 hover:text-violet-600"
								>
									Advanced Search
								</Link>
							</div>
							<Button
								radius="lg"
								variant="ghost"
								className="w-[5vw] mt-5"
								isLoading={isLoading}
								type="submit"
							>
								Search
							</Button>
						</div>
					</Form>
				</div>
			</div>
		</div>
	);
}

