import type { MetaFunction } from "@remix-run/node";
import { Button } from "@nextui-org/react";
import { SignInButton, SignUpButton } from "@clerk/remix";

import { LoaderFunction, redirect } from "@remix-run/node";
import { getAuth } from "@clerk/remix/ssr.server.js";



export const meta: MetaFunction = () => {
	return [
		{ title: "House Hunter Helper" },
		{
			name: "Helping you stay organized during your hunt.",
			content: "Start House Hunting Here!",
		},
	];
};

export const loader: LoaderFunction = async (args) => {
	const { userId } = await getAuth(args);

	if (userId) {
		return redirect("/home");
	}

	return {};
}

export default function Index() {
	return (
		<div className="relative overflow-hidden">
			<div className="blur-md w-screen h-screen bg-no-repeat bg-cover bg-center bg-fixed bg-mainimage"></div>
			<div className="bg-black bg-opacity-20 absolute w-screen top-0 left-0 h-screen z-10">
				<div className="h-full flex-col flex justify-center items-center space-y-3">
					<h1 className="text-5xl text-maintext font-bold">
						House Hunter Helper
					</h1>
					<p className="text-maintext text-center text-xl">
						Helping you stay organized during your hunt.
					</p>
					<div className="flex">
						<SignInButton mode="modal" afterSignInUrl="/home">
							<Button
								color="primary"
								className="m-2 hover:bg-slate-700 w-[10vw]"
							>
								Login
							</Button>
						</SignInButton>
						<SignUpButton mode="modal" afterSignUpUrl="/home">
							<Button
								color="success"
								className="m-2 hover:bg-green-600 w-[10vw]"
							>
								Register
							</Button>
						</SignUpButton>
					</div>
				</div>
			</div>
		</div>
	);
}

