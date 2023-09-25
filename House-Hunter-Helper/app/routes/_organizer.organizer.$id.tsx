import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { useState, useCallback, useMemo } from "react";

import { getAuth } from "@clerk/remix/ssr.server.js";

import { createClient } from "@supabase/supabase-js";
import {
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Checkbox,
	Input,
	Link,
	RadioGroup,
	Radio,
	Switch,
	Select,
	SelectItem,
	Textarea,
	Chip,
	CheckboxGroup,
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Tooltip,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownSection,
	DropdownItem,
	Pagination,
	PaginationItem,
	PaginationCursor,
} from "@nextui-org/react";

import { ChevronDown, FileDown, PencilLine, Plus, Trash2 } from "lucide-react";


export const loader: LoaderFunction = async (args) => {
	const { userId } = await getAuth(args);

	if (!userId) {
		return redirect("/");
	}

	let supabaseUrl = process.env.SUPABASE_URL;
	let supabaseKey = process.env.SUPABASE_API_KEY;

	const supabase = createClient(supabaseUrl, supabaseKey);

	/* Check If Organizer Exists */
	async function checkEntryExists() {
		const { data, error } = await supabase
			.from("Organizers")
			.select("*")
			.eq("id", args.params.id)
			.eq("userid", userId);

		if (error) {
			return false;
		}

		if (data.length < 1) {
			return false;
		}

		return true;
	}

	if (!(await checkEntryExists())) {
		return redirect("/home");
	}

	/* Update Time to Most Recent  */
	async function setUpdateTime() {
		const { data, error } = await supabase
			.from("Organizers")
			.update({ updated_at: new Date() })
			.eq("id", args.params.id)
			.eq("userid", userId)
			.select();

		if (!data) {
			redirect("/home");
		}

		return data[0].name;
	}

	const organizerName = await setUpdateTime();

	/* Collect Every Entry in Organizer */
	const { data, error } = await supabase
		.from("HomeSheets")
		.select("*")
		.eq("organizerID", args.params.id)
		.eq("userid", userId);

	if (error) {
		console.log(error);
		return json({ error });
	}

	/* Return Data */
	return json({
		data: data,
		id: args.params.id,
		name: organizerName,
		userid: userId,
	});
};

export default function Organizer() {
	const loader_data = useLoaderData<typeof loader>();

	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	/* ------------------------------------------- All Home States ------------------------------------------------- */

	const [organizerName, setOrganizerName] = useState(loader_data.name);
	const [name, setName] = useState("New Entry");
	const [address, setAddress] = useState("");
	const [price, setPrice] = useState(null);
	const [isRent, setIsRent] = useState("Rent");
	const [isRentBool, setIsRentBool] = useState(true); // true = rent, false = buy
	const [hasBasement, setHasBasement] = useState(false);
	const [hasGarage, setHasGarage] = useState(false);
	const [parkingSpots, setParkingSpots] = useState(0);
	const [bedrooms, setBedrooms] = useState(0);
	const [bathrooms, setBathrooms] = useState(0);
	const [tags, setTags] = useState([]);
	const [presetTags, setPresetTags] = useState([]);
	const [notes, setNotes] = useState("");
	const [link, setLink] = useState("");
	const [squrFeet, setSqurFeet] = useState(0);
	const [homeType, setHomeType] = useState("House");

	/* ------------------------------------------- All Home States ------------------------------------------------- */

	/* ------------------------------------------- Other States and Vairables ------------------------------------------------- */

	const [tagsError, setTagsError] = useState(false);
	const [tagsErrorMessage, setTagsErrorMessage] = useState("");

	const [entryError, setEntryError] = useState(false);
	const [entryErrorMessage, setEntryErrorMessage] = useState("");

	const [Loading, setLoading] = useState(false);

	const [selectedTags, setSelectedTags] = useState<Selection>("all");
	const [hasTagsFilter, setHasTagsFilter] = useState(false);
	const [tagList, setTagList] = useState([]);
	const [presetTagList, setPresetTagList] = useState([]);

	const [search, setSearch] = useState("");
	const [hasSearchFilter, setHasSearchFilter] = useState(false);

	const [priceMin, setPriceMin] = useState(null);
	const [priceMax, setPriceMax] = useState(null);
	const [hasPriceFilter, setHasPriceFilter] = useState(false);

	const [bedMin, setBedMin] = useState(null);
	const [bedMax, setBedMax] = useState(null);
	const [hasBedFilter, setHasBedFilter] = useState(false);

	const [bathMin, setBathMin] = useState(null);
	const [bathMax, setBathMax] = useState(null);
	const [hasBathFilter, setHasBathFilter] = useState(false);

	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);

	const [editMode, setEditMode] = useState(false);
	const [currentRowId, setCurrentRowId] = useState(null);

	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const columns = [
		{
			key: "name",
			title: "Name",
		},
		{
			key: "address",
			title: "Address",
		},
		{
			key: "price",
			title: "Price",
		},
		{
			key: "rent",
			title: "Renting?",
		},
		{
			key: "basement",
			title: "Basement",
		},
		{
			key: "garage",
			title: "Garage",
		},
		{
			key: "parkingSpaces",
			title: "Parking Spaces",
		},
		{
			key: "bedCount",
			title: "Bedrooms",
		},
		{
			key: "bathCount",
			title: "Bathrooms",
		},
		{
			key: "homeType",
			title: "Home Type",
		},
		{
			key: "squareFT",
			title: "Square Feet",
		},
		{
			key: "link",
			title: "Link",
		},
		{
			key: "tags",
			title: "Tags",
		},
		{
			key: "presetTags",
			title: "Preset Tags",
		},
		{
			key: "notes",
			title: "Notes",
		},
		{
			key: "actions",
			title: "Actions",
		},
	];

	/* ------------------------------------------- Other States and Vairables ------------------------------------------------- */

	/* ------------------------------------------- Create New Entry Functions ------------------------------------------- */

	async function createEntry() {
		if (editMode) {
			setLoading(true);
			if (name === "") {
				setEntryError(true);
				setEntryErrorMessage("Name Cannot Be Empty");
				setLoading(false);
				return;
			}

			if (address === "") {
				setEntryError(true);
				setEntryErrorMessage("Address Cannot Be Empty");
				setLoading(false);
				return;
			}

			if (price === null) {
				setEntryError(true);
				setEntryErrorMessage("Price Cannot Be Empty");
				setLoading(false);
				return;
			}
			if (isRent === "Rent") {
				setIsRentBool(true);
			} else {
				setIsRentBool(false);
			}

			let supabaseurl = window.ENV.SUPABASE_URL;
			let supabasekey = window.ENV.SUPABASE_API_KEY;
			const supabase = createClient(supabaseurl, supabasekey);

			const { error } = await supabase
				.from("HomeSheets")
				.update([
					{
						name: name,
						address: address,
						price: price,
						isRent: isRentBool,
						basement: hasBasement,
						garage: hasGarage,
						parkingSpaces: parkingSpots,
						bedCount: bedrooms,
						bathCount: bathrooms,
						tags: tags,
						presetTags: presetTags,
						notes: notes,
						link: "https://" + link,
						squareFT: squrFeet,
						homeType: homeType,
						organizerID: loader_data.id,
						userid: loader_data.userid,
					},
				])
				.eq("id", currentRowId);

			if (error) {
				console.log(error);
				return;
			}

			// reset all states
			setName("");
			setAddress("");
			setPrice(null);
			setIsRent("Rent");
			setHasBasement(false);
			setHasGarage(false);
			setParkingSpots(0);
			setBedrooms(0);
			setBathrooms(0);
			setTags([]);
			setPresetTags([]);
			setNotes("");
			setLink("");
			setSqurFeet(0);
			setHomeType("House");
			setTagsError(false);
			onOpenChange(false);
			setEditMode(false);
			setCurrentRowId(null);

			//Stop Loading
			setLoading(false);

			// reload page
			window.location.reload();
		} else {
			setLoading(true);
			if (name === "") {
				setEntryError(true);
				setEntryErrorMessage("Name Cannot Be Empty");
				setLoading(false);
				return;
			}

			if (address === "") {
				setEntryError(true);
				setEntryErrorMessage("Address Cannot Be Empty");
				setLoading(false);
				return;
			}

			if (price === null) {
				setEntryError(true);
				setEntryErrorMessage("Price Cannot Be Empty");
				setLoading(false);
				return;
			}

			if (isRent === "Rent") {
				var rent = true;
			} else {
				var rent = false;
			}

			let supabaseurl = window.ENV.SUPABASE_URL;
			let supabasekey = window.ENV.SUPABASE_API_KEY;
			const supabase = createClient(supabaseurl, supabasekey);

			const { error } = await supabase.from("HomeSheets").insert([
				{
					name: name,
					address: address,
					price: price,
					isRent: rent,
					basement: hasBasement,
					garage: hasGarage,
					parkingSpaces: parkingSpots,
					bedCount: bedrooms,
					bathCount: bathrooms,
					tags: tags,
					presetTags: presetTags,
					notes: notes,
					link: "https://" + link,
					squareFT: squrFeet,
					homeType: homeType,
					organizerID: loader_data.id,
					userid: loader_data.userid,
				},
			]);

			if (error) {
				console.log(error);
				return;
			}

			// reset all states
			setName("");
			setAddress("");
			setPrice(null);
			setIsRent("Rent");
			setHasBasement(false);
			setHasGarage(false);
			setParkingSpots(0);
			setBedrooms(0);
			setBathrooms(0);
			setTags([]);
			setPresetTags([]);
			setNotes("");
			setLink("");
			setSqurFeet(0);
			setHomeType("House");
			setTagsError(false);
			onOpenChange(false);

			//Stop Loading
			setLoading(false);

			// reload page
			window.location.reload();
		}
	}

	function addTag(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		//check if tag is empty
		if (e.target[0].value === "") {
			return;
		}

		let tag = e.target[0].value;

		// check if tag already exists
		if (tags.includes(tag) || presetTags.includes(tag)) {
			setTagsError(true);
			setTagsErrorMessage("Tag Already Exists");
			e.target[0].value = "";
			return;
		}

		// get tag from input
		// add tag to tags array
		//reset error
		// clear input

		setTags([...tags, tag]);
		setTagsError(false);
		setTagsErrorMessage("");
		e.target[0].value = "";
	}

	/* ------------------------------------------- Create New Entry Functions ------------------------------------------- */

	/* ------------------------------------------- Table Cell Rendering Function ------------------------------------------- */

	const renderCell = useCallback((item, columnKey) => {
		let cellValue = item[columnKey];

		switch (columnKey) {
			case "name":
				return <div className="w-max">{cellValue}</div>;
			case "address":
				return cellValue;
			case "price":
				return "$" + cellValue;
			case "rent":
				cellValue = item.isRent;
				if (cellValue === true) {
					return "Renting";
				} else if (cellValue === false) {
					return "Buying";
				}
			case "basement":
				if (cellValue === true) {
					return "Yes";
				} else {
					return "No";
				}
			case "garage":
				if (cellValue === true) {
					return "Yes";
				} else {
					return "No";
				}
			case "parkingSpaces":
				return cellValue;
			case "bedCount":
				return cellValue;
			case "bathCount":
				return cellValue;
			case "homeType":
				return cellValue;
			case "squareFT":
				return cellValue;
			case "link":
				return (
					<Tooltip content="Click to Open Link">
						<Link
							href={cellValue}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:cursor-pointer hover:text-primary-500 underline text-sm"
						>
							{cellValue}
						</Link>
					</Tooltip>
				);
			case "tags":
				return cellValue.map((tag, i) => (
					<div key={i} className="mb-2">
						<Chip
							size="sm"
							color="primary"
							radius="lg"
							variant="shadow"
							key={i}
						>
							{tag}
						</Chip>
					</div>
				));
			case "presetTags":
				return cellValue.map((tag, i) => (
					<div key={i} className="mb-2">
						<Chip
							size="sm"
							color="success"
							radius="lg"
							variant="shadow"
							key={i}
						>
							{tag}
						</Chip>
					</div>
				));
			case "notes":
				return cellValue;
			case "actions":
				return (
					<div className="flex flex-row justify-center items-center gap-4">
						<Tooltip content="Edit Entry">
							<span
								className="hover:cursor-pointer"
								onClick={() => editEntry(item.id)}
							>
								<PencilLine />
							</span>
						</Tooltip>
						<Tooltip
							content="Delete Entry"
							color="danger"
							placement="bottom"
						>
							<span
								className="hover:cursor-pointer text-red-600"
								onClick={() => {
									setCurrentRowId(item.id);
									setShowDeleteModal(true);
									onOpen();
								}}
							>
								<Trash2 />
							</span>
						</Tooltip>
					</div>
				);
			default:
				return cellValue;
		}
	}, []);

	/* ------------------------------------------- Table Cell Rendering Function ------------------------------------------- */

	/* ------------------------------------------- Table Filtering Function ------------------------------------------- */
	function addToTagList() {
		loader_data.data.map((item, i) =>
			item.tags.map((tag, i) => {
				if (!tagList.includes(tag)) {
					setTagList([...tagList, tag]);
				}
			})
		);
	}

	function addToPresetTagList() {
		loader_data.data.map((item, i) =>
			item.presetTags.map((tag, i) => {
				if (!presetTagList.includes(tag)) {
					setPresetTagList([...presetTagList, tag]);
				}
			})
		);
	}

	addToTagList();
	addToPresetTagList();

	async function changeOrganizerName(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const name = e.target[0].value;
		let supabaseurl = window.ENV.SUPABASE_URL;
		let supabasekey = window.ENV.SUPABASE_API_KEY;
		const supabase = createClient(supabaseurl, supabasekey);
		const { error } = await supabase
			.from("Organizers")
			.update({ name: name })
			.eq("id", loader_data.id)
			.eq("userid", loader_data.userid);

		setOrganizerName(name);

		if (error) {
			console.log(error);
			return;
		}
	}

	const filteredItems = useMemo(() => {
		let temp = loader_data.data;

		if (
			selectedTags !== "all" &&
			selectedTags.size !== tagList.length + presetTagList.length
		) {
			temp = temp.filter((item) =>
				Array.from(selectedTags).some(
					(tag) =>
						item.tags.includes(tag) || item.presetTags.includes(tag)
				)
			);
		}

		if (hasSearchFilter) {
			temp = temp.filter((item) =>
				item.name.toLowerCase().includes(search.toLowerCase())
			);
		}

		if (hasPriceFilter) {
			temp = temp.filter(
				(item) => item.price >= priceMin && item.price <= priceMax
			);
		}

		if (hasBedFilter) {
			temp = temp.filter(
				(item) => item.bedCount >= bedMin && item.bedCount <= bedMax
			);
		}

		if (hasBathFilter) {
			temp = temp.filter(
				(item) => item.bathCount >= bathMin && item.bathCount <= bathMax
			);
		}

		return temp;
	}, [
		loader_data.data,
		hasTagsFilter,
		selectedTags,
		hasSearchFilter,
		search,
		hasPriceFilter,
		priceMin,
		priceMax,
		hasBedFilter,
		bedMin,
		bedMax,
		hasBathFilter,
		bathMin,
		bathMax,
	]);

	/* ------------------------------------------- Table Filtering Function ------------------------------------------- */

	/* ------------------------------------------- Pagination ------------------------------------------- */

	const pages = Math.ceil(filteredItems.length / rowsPerPage);

	const onPreviousPage = useCallback(() => {
		setCurrentPage((currentPage) => currentPage - 1);
	}, []);

	const onNextPage = useCallback(() => {
		setCurrentPage((currentPage) => currentPage + 1);
	}, []);

	const items = useMemo(() => {
		const start = (currentPage - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		return filteredItems.slice(start, end);
	}, [filteredItems, currentPage, rowsPerPage]);

	/* ------------------------------------------- Pagination ------------------------------------------- */

	/* ------------------------------------------- Top And Bottom Content for Table (Filters, Pagination, etc.) ------------------------------------------- */

	const bottomcontent = useMemo(() => {
		return (
			<div className="flex flex-row justify-center items-center">
				<Pagination
					isCompact
					showControls
					showShadow
					size="lg"
					color="primary"
					page={currentPage}
					total={pages}
					onChange={setCurrentPage}
				/>
			</div>
		);
	}, [
		items.length,
		currentPage,
		pages,
		hasSearchFilter,
		selectedTags,
		hasPriceFilter,
		hasBedFilter,
		hasBathFilter,
	]);

	const topcontent = useMemo(() => {
		return (
			<>
				<div className="flex flex-row gap-3">
					<Input
						placeholder="Search By Name"
						startContent={
							<div className="pointer-events-none flex items-center">
								<span className="text-default-400 text-small">
									🔍
								</span>
							</div>
						}
						onChange={(e) => {
							setSearch(e.target.value);
							setHasSearchFilter(true);
						}}
					/>
					<Dropdown>
						<DropdownTrigger>
							<Button className="px-7">
								<span className="text-small">
									Rows Per Page: {rowsPerPage}
								</span>
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							disallowEmptySelection
							defaultSelectedKeys={[10]}
							selectionMode="single"
							onAction={(k) => {
								setRowsPerPage(k);
								setCurrentPage(1);
							}}
						>
							<DropdownSection>
								<DropdownItem key={5}>5 Rows</DropdownItem>
								<DropdownItem key={10}>10 Rows</DropdownItem>
								<DropdownItem key={15}>15 Rows</DropdownItem>
							</DropdownSection>
						</DropdownMenu>
					</Dropdown>
					<Dropdown>
						<DropdownTrigger>
							<Button endContent={<ChevronDown />}>Tags</Button>
						</DropdownTrigger>
						<DropdownMenu
							selectionMode="multiple"
							closeOnSelect={false}
							selectedKeys={selectedTags}
							onSelectionChange={setSelectedTags}
						>
							<DropdownSection>
								{tagList.map((tag, i) => (
									<DropdownItem key={tag} color="primary">
										{tag}
									</DropdownItem>
								))}
								{presetTagList.map((tag, i) => (
									<DropdownItem key={tag} color="success">
										{tag}
									</DropdownItem>
								))}
							</DropdownSection>
						</DropdownMenu>
					</Dropdown>
					<Dropdown>
						<DropdownTrigger>
							<Button
								startContent={<FileDown />}
								variant="flat"
							></Button>
						</DropdownTrigger>
						<DropdownMenu>
							<DropdownSection>
								<DropdownItem>CSV</DropdownItem>
								<DropdownItem>JSON</DropdownItem>
								<DropdownItem>PDF</DropdownItem>
							</DropdownSection>
						</DropdownMenu>
					</Dropdown>
				</div>
				<div className="flex flex-row justify-between">
					<div>
						<span className="text-default-400 text-small">
							Showing{" "}
							{items.length < rowsPerPage
								? items.length
								: rowsPerPage}{" "}
							of {filteredItems.length}{" "}
							{/* if data is less that row show length of data */}
							Entries
						</span>
					</div>
					<div className="flex items-center gap-5">
						<Button
							startContent={<Plus />}
							color="primary"
							size="md"
							onPressStart={() => {
								setEditMode(false);
								setName("");
								setAddress("");
								setPrice(null);
								setIsRent("Rent");
								setHasBasement(false);
								setHasGarage(false);
								setParkingSpots(0);
								setBedrooms(0);
								setBathrooms(0);
								setTags([]);
								setPresetTags([]);
								setNotes("");
								setLink("");
								setSqurFeet(0);
								setHomeType("House");
								setTagsError(false);
								setTagsErrorMessage("");
								onOpen();
							}}
						>
							Create New Entry
						</Button>
						<Button
							color="warning"
							size="sm"
							onClick={() => {
								setHasTagsFilter(false);
								setHasSearchFilter(false);
								setHasPriceFilter(false);
								setHasBedFilter(false);
								setHasBathFilter(false);
								setSelectedTags([]);
								setSearch("");
								setPriceMin(null);
								setPriceMax(null);
								setBedMin(null);
								setBedMax(null);
								setBathMin(null);
								setBathMax(null);
							}}
						>
							Clear Filters
						</Button>
					</div>
				</div>
				<div className="flex justify-end items-center"></div>
			</>
		);
	}, [
		rowsPerPage,
		items.length,
		selectedTags,
		hasSearchFilter,
		currentPage,
		hasPriceFilter,
		hasBedFilter,
		hasBathFilter,
		pages,
	]);

	/* ------------------------------------------- Top And Bottom Content for Table ------------------------------------------- */

	/* ------------------------------------------- Edit and Delete Functions ------------------------------------------- */

	async function deleteEntry() {
		let supabaseurl = window.ENV.SUPABASE_URL;
		let supabasekey = window.ENV.SUPABASE_API_KEY;
		const supabase = createClient(supabaseurl, supabasekey);
		const { error } = await supabase
			.from("HomeSheets")
			.delete()
			.eq("id", currentRowId);

		if (error) {
			console.log(error);
			return;
		}

		setShowDeleteModal(false);

		window.location.reload();
	}

	async function editEntry(id) {
		setEditMode(true);
		setShowDeleteModal(false);
		let supabaseurl = window.ENV.SUPABASE_URL;
		let supabasekey = window.ENV.SUPABASE_API_KEY;
		const supabase = createClient(supabaseurl, supabasekey);
		const { data, error } = await supabase
			.from("HomeSheets")
			.select("*")
			.eq("id", id);
		setName(data[0].name);
		setAddress(data[0].address);
		setPrice(data[0].price);
		if (data[0].isRent === true) {
			setIsRent("Rent");
		} else {
			setIsRent("Buy");
		}
		setHasBasement(data[0].basement);
		setHasGarage(data[0].garage);
		setParkingSpots(data[0].parkingSpaces);
		setBedrooms(data[0].bedCount);
		setBathrooms(data[0].bathCount);
		setTags(data[0].tags);
		setPresetTags(data[0].presetTags);
		setNotes(data[0].notes);
		setLink(data[0].link);
		setSqurFeet(data[0].squareFT);
		setHomeType(data[0].homeType);
		setEntryError(false);
		setEntryErrorMessage("");
		setCurrentRowId(id);
		onOpen();
	}

	/* ------------------------------------------- Edit and Delete Functions ------------------------------------------- */

	return (
		<div className="h-screen flex flex-col">
			{loader_data.data.length === 0 ? (
				<div className="flex h-full justify-center items-center">
					<Button onPressStart={onOpen}>Create New Entry</Button>
				</div>
			) : (
				<div className="p-8">
					<div>
						<Form onSubmit={(e) => changeOrganizerName(e)}>
							<Input
								placeholder={
									organizerName
										? organizerName
										: "Organizer Name"
								}
								variant="underlined"
								className="mb-3 w-max"
								isInvalid={entryError}
								errorMessage={entryErrorMessage}
							/>
						</Form>
					</div>

					<Table
						topContent={topcontent}
						bottomContent={bottomcontent}
						bottomContentPlacement="outside"
						isStriped
					>
						<TableHeader columns={columns}>
							{(column) => (
								<TableColumn key={column.key}>
									{column.title}
								</TableColumn>
							)}
						</TableHeader>
						<TableBody items={items}>
							{(item) => (
								<TableRow key={item.id}>
									{(columnKey) => (
										<TableCell>
											{renderCell(item, columnKey)}
										</TableCell>
									)}
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			)}
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				placement="auto"
				backdrop="blur"
				size="lg"
				scrollBehavior="outside"
			>
				<ModalContent>
					{(onClose) => (
						<>
							{showDeleteModal ? (
								<ModalHeader className="flex flex-col gap-1">
									Delete Entry
								</ModalHeader>
							) : (
								<ModalHeader className="flex flex-col gap-1">
									Create New Entry
								</ModalHeader>
							)}
							{showDeleteModal ? (
								<ModalBody>
									<div className="flex flex-col gap-2">
										<p>
											Are you sure you want to delete this
											entry?
										</p>
									</div>
								</ModalBody>
							) : (
								<ModalBody>
									<Input
										label="Name"
										placeholder="Name of Entry"
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										className="mb-2"
										isInvalid={entryError}
										errorMessage={entryErrorMessage}
									/>
									<Input
										label="Address"
										placeholder="Address"
										value={address}
										onChange={(e) =>
											setAddress(e.target.value)
										}
										className="mb-2"
										isInvalid={entryError}
										errorMessage={entryErrorMessage}
									/>
									{isRent === "Rent" ? (
										<Input
											label="Price"
											placeholder="Price (will be rounded to nearest 100th)"
											type="number"
											value={price}
											startContent={
												<div className="pointer-events-none flex items-center">
													<span className="text-default-400 text-small">
														$
													</span>
												</div>
											}
											endContent={
												<div className="pointer-events-none flex items-center">
													<span className="text-default-400 text-small">
														/mo
													</span>
												</div>
											}
											onChange={(e) =>
												setPrice(e.target.value)
											}
											className="mb-2"
											isInvalid={entryError}
											errorMessage={entryErrorMessage}
										/>
									) : (
										<Input
											label="Price"
											placeholder="Price (will be rounded to nearest 100th)"
											type="number"
											value={price}
											startContent={
												<div className="pointer-events-none flex items-center">
													<span className="text-default-400 text-small">
														$
													</span>
												</div>
											}
											onChange={(e) =>
												setPrice(e.target.value)
											}
											className="mb-2"
											isInvalid={entryError}
											errorMessage={entryErrorMessage}
										/>
									)}
									<div className="grid grid-cols-3 mb-2">
										<RadioGroup
											label="Rent or Buy"
											orientation="horizontal"
											value={isRent}
											onChange={(e) =>
												setIsRent(e.target.value)
											}
										>
											<Radio value="Rent">Rent</Radio>
											<Radio value="Buy">Buy</Radio>
										</RadioGroup>
										<div className="flex flex-col justify-center items-center w-full h-full space-y-2">
											<p>Has A Basement?</p>
											<Switch
												isSelected={hasBasement}
												onValueChange={setHasBasement}
											/>
										</div>
										<div className="flex flex-col justify-center items-center w-full h-full space-y-2">
											<p>Has A Garage?</p>
											<Switch
												isSelected={hasGarage}
												onValueChange={setHasGarage}
											/>
										</div>
									</div>
									<div className="grid grid-cols-3 gap-2 mb-2">
										<Input
											label="# Parking Spots"
											placeholder="Parking Spots"
											type="number"
											value={parkingSpots}
											onChange={(e) =>
												setParkingSpots(e.target.value)
											}
										/>
										<Input
											label="# Bedrooms"
											placeholder="Bedrooms"
											type="number"
											value={bedrooms}
											onChange={(e) =>
												setBedrooms(e.target.value)
											}
										/>
										<Input
											label="# Bathrooms"
											placeholder="Bathrooms"
											type="number"
											value={bathrooms}
											onChange={(e) =>
												setBathrooms(e.target.value)
											}
										/>
									</div>
									<Select
										label="Home Type"
										value={homeType}
										onChange={(e) =>
											setHomeType(e.target.value)
										}
										defaultSelectedKeys={["House"]}
									>
										<SelectItem key="House" value="House">
											House
										</SelectItem>
										<SelectItem
											key="TownHome"
											value="TownHome"
										>
											TownHome
										</SelectItem>
										<SelectItem
											key="Apartment"
											value="Apartment"
										>
											Apartment
										</SelectItem>
										<SelectItem
											key="Multi-Family Home"
											value="Multi-Family Home"
										>
											Multi-Family Home
										</SelectItem>
										<SelectItem key="Condo" value="Condo">
											Condo
										</SelectItem>
									</Select>
									<div className="grid grid-cols-2 gap-2">
										<Input
											label="Square Feet"
											placeholder="Square Feet"
											type="number"
											value={squrFeet}
											onChange={(e) =>
												setSqurFeet(e.target.value)
											}
											className="mb-2"
										/>
										<Input
											label="Link"
											placeholder=""
											value={link}
											startContent={
												<div className="pointer-events-none flex items-center">
													<span className="text-default-400 text-small">
														https://
													</span>
												</div>
											}
											onChange={(e) =>
												setLink(e.target.value)
											}
											className="mb-2"
										/>
									</div>
									<div>
										<CheckboxGroup
											label="Select Tags"
											orientation="horizontal"
											onChange={(e) => setPresetTags(e)}
										>
											<Checkbox value="AC">AC</Checkbox>
											<Checkbox value="Washer/Dryer">
												Washer/Dryer
											</Checkbox>
											<Checkbox value="Backyard">
												Backyard
											</Checkbox>
											<Checkbox value="Balcony">
												Balcony
											</Checkbox>
											<Checkbox value="Island">
												Island
											</Checkbox>
											<Checkbox value="Dishwasher">
												Dishwasher
											</Checkbox>
											<Checkbox value="Stainless Steel">
												Stainless Steel
											</Checkbox>
											<Checkbox value="Hardwood Floors">
												Hardwood Floors
											</Checkbox>
											<Checkbox value="Carpet">
												Carpet
											</Checkbox>
											<Checkbox value="Pets Allowed">
												Pets Allowed
											</Checkbox>
										</CheckboxGroup>
									</div>
									<div className="flex flex-row flex-wrap items-center gap-2">
										{presetTags.map((tag, i) => (
											<div key={i}>
												<Chip
													size="sm"
													color="success"
													radius="lg"
													variant="shadow"
													key={i}
												>
													{tag}
												</Chip>
											</div>
										))}
									</div>
									<Form onSubmit={(e) => addTag(e)}>
										<Input
											label="Additional Tags"
											placeholder="Ex. Pool, Hot Tub, etc..."
											size="sm"
											className="mb-2"
											isInvalid={tagsError}
											errorMessage={tagsErrorMessage}
										/>
									</Form>
									<div className="flex flex-row flex-wrap items-center gap-2">
										{tags.map((tag, i) => (
											<div key={i}>
												<Chip
													size="sm"
													color="primary"
													radius="lg"
													variant="shadow"
													key={i}
													onClose={() => {
														setTags(
															tags.filter(
																(t) => t !== tag
															)
														);
													}}
												>
													{tag}
												</Chip>
											</div>
										))}
									</div>
									<div className="flex flex-col">
										<p>Additional Notes:</p>
										<Textarea
											placeholder="Additional Notes"
											value={notes}
											onChange={(e) =>
												setNotes(e.target.value)
											}
											className="mb-2"
										/>
									</div>
								</ModalBody>
							)}
							{showDeleteModal ? (
								<ModalFooter>
									<div className="flex flex-row gap-2">
										<Button
											color="danger"
											onClick={() =>
												deleteEntry(currentRowId)
											}
										>
											Yes
										</Button>
										<Button
											color="primary"
											onClick={() => {
												setShowDeleteModal(false);
												onClose();
											}}
										>
											No
										</Button>
									</div>
								</ModalFooter>
							) : (
								<ModalFooter>
									<Button
										color="danger"
										variant="flat"
										onPress={onClose}
									>
										Close
									</Button>
									{editMode ? (
										<Button
											color="success"
											isLoading={Loading}
											onPressStart={() => createEntry()}
										>
											Edit Entry
										</Button>
									) : (
										<Button
											color="success"
											isLoading={Loading}
											onPressStart={() => createEntry()}
										>
											Create Entry
										</Button>
									)}
								</ModalFooter>
							)}
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
