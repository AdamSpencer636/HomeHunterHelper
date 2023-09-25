import { useState } from "react";

import { defer, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";

import { getAuth } from "@clerk/remix/ssr.server.js";
import { createClerkClient } from "@clerk/remix/api.server.js";

import { createClient } from "@supabase/supabase-js";

import { Await } from "@remix-run/react";
import { Suspense } from "react";

import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Button,
	Spacer,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownSection,
	DropdownItem,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Input,
	Spinner,
} from "@nextui-org/react";

import { Home, MoreVertical, Plus } from "lucide-react";

//Loader (Runs before page is rendered)
export const loader: LoaderFunction = async (args) => {
	const { userId } = await getAuth(args);

	if (!userId) {
		return redirect("/");
	}

	const user = await createClerkClient({
		secretKey: process.env.CLERK_SECRET_KEY,
	}).users.getUser(userId);

	//---------------------------------------------------------------------------------------------------
	let supabaseUrl = process.env.SUPABASE_URL;
	let supabaseKey = process.env.SUPABASE_API_KEY;

	async function getAllOrganizers(supabaseUrl: string, supabaseKey: string) {
		const supabase = createClient(supabaseUrl, supabaseKey);

		let { data, error } = await supabase
			.from("Organizers")
			.select()
			.eq("userid", userId)
			.order("updated_at", { ascending: true });

		if (error) {
			return false;
		}

		let homeSheets = data;

		return homeSheets;
	}

	async function getFiveRecentOrganizers(
		supabaseUrl: string,
		supabaseKey: string
	) {
		const supabase = createClient(supabaseUrl, supabaseKey);

		let { data, error } = await supabase
			.from("Organizers")
			.select("*")
			.eq("userid", userId)
			.order("updated_at", { ascending: false })
			.limit(5);

		if (error) {
			return false;
		}

		let homeSheets = data;

		return homeSheets;
	}

	//---------------------------------------------------------------------------------------------------

	let RecentData = await getFiveRecentOrganizers(supabaseUrl, supabaseKey);

	let AllData = await getAllOrganizers(supabaseUrl, supabaseKey);

	return defer({
		all_data: AllData,
		recent_data: RecentData,
		user: user,
		supabaseurl: supabaseUrl,
		supabasekey: supabaseKey,
	});
};

export default function HomePage() {
	const loader_data = useLoaderData<typeof loader>();
	console.log(loader_data);
	let navigate = useNavigate();
	const user = loader_data.user;
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const [Loading, setLoading] = useState(false);
	const [OrgLoading, setOrgLoading] = useState(false);
	const [OrganizerName, setOrganizerName] = useState("");
	const [OrganizerId, setOrganizerId] = useState("");
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	async function createNewOrganizer() {
		setLoading(true);

		const supabase = createClient(
			loader_data.supabaseurl,
			loader_data.supabasekey
		);

		const { data, error } = await supabase
			.from("Organizers")
			.insert([
				{
					name: "New Organizer",
					userid: loader_data.user.id,
				},
			])
			.select();

		if (error) {
			console.log(error);
		}

		navigate(`/organizer/${data[0].id}`);
	}

	async function dropdownAction(key: string, id: string) {
		if (key === "edit") {
			setIsDeleteModalOpen(false);
			setOrganizerId(id);
			onOpen();
		} else if (key === "delete") {
			setIsDeleteModalOpen(true);
			setOrganizerId(id);
			onOpen();
		}
	}

	async function updateOrganizerName(name: string) {
		const supabase = createClient(
			loader_data.supabaseurl,
			loader_data.supabasekey
		);

		const { data, error } = await supabase
			.from("Organizers")
			.update({ name: name })
			.eq("id", OrganizerId);

		if (error) {
			console.log(error);
		}

		//Refresh Page
		navigate("/home");
	}

	async function deleteOrganizer(id: string) {
		const supabase = createClient(
			loader_data.supabaseurl,
			loader_data.supabasekey
		);

		const { data, error } = await supabase
			.from("Organizers")
			.delete()
			.eq("id", id);

		if (error) {
			console.log(error);
		}

		//Refresh Page
		navigate("/home");
	}

	return (
		<div className="w-screen h-screen">
			<div className="">
				<h1 className="text-5xl text-center font-semibold mb-5">
					Welcome {user.username.toUpperCase()}
				</h1>
			</div>
			<div className="">
				<div className="flex flex-row flex-wrap justify-center">
					{/* Get 5 Most Recent Organizers (Implement Card Skeleton) */}
					{loader_data.recent_data.map((homeSheet: any) => (
						<Card
							key={homeSheet.id}
							shadow="lg"
							className="m-5 w-[15vw] h-[15vw] min-w-max min-h-max"
							isPressable
							onPressStart={() => {
								setOrgLoading(true);
								navigate(`/organizer/${homeSheet.id}`);
							}}
						>
							<CardHeader>
								<div className="flex justify-between items-center h-full w-full">
									<p className="text-xl ">{homeSheet.name}</p>
									<Dropdown>
										<DropdownTrigger>
											<MoreVertical size={20} />
										</DropdownTrigger>
										<DropdownMenu
											aria-label="Static Actions"
											selectionMode="single"
											onAction={(k) =>
												dropdownAction(k, homeSheet.id)
											}
										>
											<DropdownItem key="edit">
												Edit Organizer Name
											</DropdownItem>
											<DropdownItem
												key="delete"
												className="text-danger"
												color="danger"
											>
												Delete Organizer
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</div>
							</CardHeader>
							<CardBody>
								<div className="w-full h-full rounded-lg bg-background flex justify-center items-center">
									{OrgLoading ? (
										<Spinner size="lg" />
									) : (
										<Home
											size={100}
											className="text-success"
										/>
									)}
								</div>
							</CardBody>
						</Card>
					))}
				</div>
			</div>
			<div className="h-max flex items-center justify-center">
				{loader_data.all_data.length < 6 ? (
					<Button
						color="success"
						className="m-2 w-[10vw] min-w-max"
						startContent={<Plus size={20} />}
						onClick={() => createNewOrganizer()}
						isLoading={Loading}
					>
						Create New Organizer
					</Button>
				) : (
					//List of all organizers
					<div className="w-full">
						<div className="flex justify-center items-center py-3">
							<h1 className="text-2xl font-semibold">
								All Organizers
							</h1>
						</div>
						<div className="w-screen flex flex-row flex-wrap flex-grow justify-center">
							{loader_data.all_data.map((homeSheet: any) => (
								<Card
									key={homeSheet.id}
									shadow="lg"
									className="m-5 w-[8vw] h-[8vw] min-w-max min-h-max"
									isPressable
									onPressStart={() => {
										setOrgLoading(true);
										navigate(`/organizer/${homeSheet.id}`);
									}}
								>
									<CardHeader>
										<div className="flex justify-between items-center h-full w-full">
											<p>{homeSheet.name}</p>
											<Dropdown>
												<DropdownTrigger>
													<MoreVertical size={20} />
												</DropdownTrigger>
												<DropdownMenu
													aria-label="Static Actions"
													selectionMode="single"
													onAction={(k) =>
														dropdownAction(
															k,
															homeSheet.id
														)
													}
												>
													<DropdownItem key="edit">
														Edit Organizer Name
													</DropdownItem>
													<DropdownItem
														key="delete"
														className="text-danger"
														color="danger"
													>
														Delete Organizer
													</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</div>
									</CardHeader>
									<CardBody>
										<div className="w-full h-full rounded-lg bg-background flex justify-center items-center">
											{OrgLoading ? (
												<Spinner size="lg" />
											) : (
												<Home
													size={100}
													className="text-success"
												/>
											)}
										</div>
									</CardBody>
								</Card>
							))}
						</div>
					</div>
				)}
			</div>
			<Modal size="md" isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							{isDeleteModalOpen ? (
								<ModalHeader className="flex flex-col gap-1">
									Delete Organizer
								</ModalHeader>
							) : (
								<ModalHeader className="flex flex-col gap-1">
									Edit Organizer Name
								</ModalHeader>
							)}
							{isDeleteModalOpen ? (
								<ModalBody>
									Are you sure you want to delete this
									organizer?{" "}
									<span className="font-bold">
										This action cannot be undone.
									</span>
								</ModalBody>
							) : (
								<ModalBody>
									<Input
										label="Organizer Name"
										placeholder="Organizer Name"
										value={OrganizerName}
										onChange={(e) =>
											setOrganizerName(e.target.value)
										}
									/>
								</ModalBody>
							)}
							{isDeleteModalOpen ? (
								<ModalFooter>
									<Button
										color="primary"
										variant="light"
										onPress={onClose}
									>
										Close
									</Button>
									<Button
										color="danger"
										onPress={() => {
											//Delete Organizer
											deleteOrganizer(OrganizerId);
											onClose();
										}}
									>
										Delete
									</Button>
								</ModalFooter>
							) : (
								<ModalFooter>
									<Button
										color="primary"
										variant="light"
										onPress={onClose}
									>
										Close
									</Button>
									<Button
										color="success"
										onPress={() => {
											//Edit Organizer Name
											updateOrganizerName(OrganizerName);
											onClose();
										}}
									>
										Confirm
									</Button>
								</ModalFooter>
							)}
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
