"use client";

import { motion, useInView } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";

interface Product {
	id: number;
	name: string;
	price: number;
	image: string;
	category: string;
	description: string;
	sizes?: string[];
}

interface CartItem extends Product {
	quantity: number;
	selectedSize?: string;
}

const Store = () => {
	const t = useTranslations("store");
	const format = useFormatter();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [activeFilter, setActiveFilter] = useState("all");
	const [cart, setCart] = useState<CartItem[]>([]);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [selectedSize, setSelectedSize] = useState<string>("");

	const products: Product[] = [
		{
			id: 1,
			name: t("products.tshirt.name"),
			price: 89.9,
			image:
				"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
			category: "clothing",
			description: t("products.tshirt.description"),
			sizes: ["P", "M", "G", "GG"],
		},
		{
			id: 2,
			name: t("products.hoodie.name"),
			price: 189.9,
			image:
				"https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
			category: "clothing",
			description: t("products.hoodie.description"),
			sizes: ["P", "M", "G", "GG"],
		},
		{
			id: 3,
			name: t("products.bachi.name"),
			price: 149.9,
			image:
				"https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=400&fit=crop",
			category: "accessories",
			description: t("products.bachi.description"),
		},
		{
			id: 4,
			name: t("products.cd.name"),
			price: 49.9,
			image:
				"https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
			category: "music",
			description: t("products.cd.description"),
		},
		{
			id: 5,
			name: t("products.poster.name"),
			price: 39.9,
			image:
				"https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop",
			category: "accessories",
			description: t("products.poster.description"),
		},
		{
			id: 6,
			name: t("products.cap.name"),
			price: 59.9,
			image:
				"https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
			category: "clothing",
			description: t("products.cap.description"),
			sizes: [t("oneSize")],
		},
		{
			id: 7,
			name: t("products.totebag.name"),
			price: 45.9,
			image:
				"https://images.unsplash.com/photo-1597633125097-5a9ae3a30d1a?w=400&h=400&fit=crop",
			category: "accessories",
			description: t("products.totebag.description"),
		},
		{
			id: 8,
			name: t("products.vinyl.name"),
			price: 129.9,
			image:
				"https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400&h=400&fit=crop",
			category: "music",
			description: t("products.vinyl.description"),
		},
	];

	const filters = [
		{ key: "all", label: t("filters.all") },
		{ key: "clothing", label: t("filters.clothing") },
		{ key: "accessories", label: t("filters.accessories") },
		{ key: "music", label: t("filters.music") },
	];

	const filteredProducts =
		activeFilter === "all"
			? products
			: products.filter((p) => p.category === activeFilter);

	const addToCart = (product: Product, size?: string) => {
		setCart((prev) => {
			const existingItem = prev.find(
				(item) => item.id === product.id && item.selectedSize === size,
			);
			if (existingItem) {
				return prev.map((item) =>
					item.id === product.id && item.selectedSize === size
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}
			return [...prev, { ...product, quantity: 1, selectedSize: size }];
		});
		setSelectedProduct(null);
		setSelectedSize("");
		setIsCartOpen(true);
	};

	const removeFromCart = (productId: number, size?: string) => {
		setCart((prev) =>
			prev.filter(
				(item) => !(item.id === productId && item.selectedSize === size),
			),
		);
	};

	const updateQuantity = (
		productId: number,
		size: string | undefined,
		delta: number,
	) => {
		setCart((prev) =>
			prev
				.map((item) =>
					item.id === productId && item.selectedSize === size
						? { ...item, quantity: Math.max(0, item.quantity + delta) }
						: item,
				)
				.filter((item) => item.quantity > 0),
		);
	};

	const cartTotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

	const formatPrice = (value: number) =>
		format.number(value, { style: "currency", currency: "BRL" });

	const chooseProduct = (product: Product) => {
		const firstSize = product.sizes?.[0];
		if (firstSize) {
			setSelectedProduct(product);
			setSelectedSize(firstSize);
		} else {
			addToCart(product);
		}
	};

	return (
		<>
			<div className="pt-24 pb-16">
				{/* Hero Section */}
				<section className="bg-muted py-16">
					<div className="container mx-auto px-4">
						<Link
							href="/"
							className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
						>
							<ArrowLeft className="w-4 h-4" aria-hidden="true" />
							{t("backHome")}
						</Link>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<span className="inline-block text-primary font-heading font-semibold uppercase tracking-widest text-sm mb-4">
								{t("label")}
							</span>
							<h1 className="heading-section text-primary-foreground mb-4">
								{t("title")}
							</h1>
							<p className="text-lg text-muted-foreground max-w-2xl">
								{t("description")}
							</p>
						</motion.div>
					</div>
				</section>

				{/* Products Section */}
				<section ref={ref} className="section-padding">
					<div className="container mx-auto px-4">
						{/* Filters */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.5 }}
							className="flex flex-wrap gap-3 mb-12 justify-center"
						>
							{filters.map((filter) => (
								<button
									key={filter.key}
									type="button"
									onClick={() => setActiveFilter(filter.key)}
									aria-pressed={activeFilter === filter.key}
									className={`px-6 py-2 font-heading font-semibold uppercase tracking-wider text-sm transition-all duration-300 ${
										activeFilter === filter.key
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground hover:text-primary"
									}`}
								>
									{filter.label}
								</button>
							))}
						</motion.div>

						{/* Products Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
							{filteredProducts.map((product, index) => (
								<motion.div
									key={product.id}
									initial={{ opacity: 0, y: 30 }}
									animate={isInView ? { opacity: 1, y: 0 } : {}}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									className="group bg-muted rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
								>
									<div className="relative aspect-square overflow-hidden">
										<Image
											src={product.image}
											alt={product.name}
											fill
											sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
											className="object-cover group-hover:scale-110 transition-transform duration-500"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
											<button
												type="button"
												onClick={() => chooseProduct(product)}
												className="px-6 py-2 bg-primary text-primary-foreground font-heading font-semibold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
											>
												{t("addToCart")}
											</button>
										</div>
									</div>
									<div className="p-4">
										<span className="text-xs text-primary font-semibold uppercase tracking-wider">
											{filters.find((f) => f.key === product.category)?.label}
										</span>
										<h3 className="font-heading font-bold text-primary-foreground mt-1 mb-2">
											{product.name}
										</h3>
										<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
											{product.description}
										</p>
										<div className="flex items-center justify-between">
											<span className="font-heading font-bold text-lg text-primary">
												{formatPrice(product.price)}
											</span>
											<button
												type="button"
												onClick={() => chooseProduct(product)}
												aria-label={`${t("addToCart")}: ${product.name}`}
												className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
											>
												<ShoppingBag className="w-5 h-5" aria-hidden="true" />
											</button>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Disclaimer */}
				<section className="bg-primary/5 py-12">
					<div className="container mx-auto px-4 text-center">
						<p className="text-muted-foreground italic">{t("disclaimer")}</p>
					</div>
				</section>
			</div>

			{/* Floating Cart Button */}
			<motion.button
				type="button"
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				onClick={() => setIsCartOpen(true)}
				aria-label={`${t("openCart")} (${cartCount})`}
				className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center z-40"
			>
				<ShoppingBag className="w-6 h-6" aria-hidden="true" />
				{cartCount > 0 && (
					<span
						aria-hidden="true"
						className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
					>
						{cartCount}
					</span>
				)}
			</motion.button>

			{/* Size Selection Modal */}
			<Dialog
				open={selectedProduct !== null}
				onClose={() => setSelectedProduct(null)}
				overlayClassName="bg-black/70"
			>
				{selectedProduct && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<DialogContent
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-background rounded-lg max-w-md w-full p-6"
						>
							<div className="flex items-start gap-4 mb-6">
								<Image
									src={selectedProduct.image}
									alt={selectedProduct.name}
									width={96}
									height={96}
									className="w-24 h-24 object-cover rounded-lg"
								/>
								<div>
									<DialogTitle className="font-heading font-bold text-lg text-primary-foreground">
										{selectedProduct.name}
									</DialogTitle>
									<p className="text-primary font-bold">
										{formatPrice(selectedProduct.price)}
									</p>
								</div>
							</div>

							<div className="mb-6">
								<span className="block text-sm font-semibold text-primary-foreground mb-3">
									{t("selectSize")}
								</span>
								<div className="flex gap-2">
									{selectedProduct.sizes?.map((size) => (
										<button
											key={size}
											type="button"
											onClick={() => setSelectedSize(size)}
											aria-pressed={selectedSize === size}
											className={`px-4 py-2 border-2 font-semibold transition-colors ${
												selectedSize === size
													? "border-primary bg-primary text-primary-foreground"
													: "border-border text-muted-foreground hover:border-primary"
											}`}
										>
											{size}
										</button>
									))}
								</div>
							</div>

							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => setSelectedProduct(null)}
									className="flex-1 px-6 py-3 border border-border text-muted-foreground font-semibold hover:bg-muted transition-colors"
								>
									{t("cancel")}
								</button>
								<button
									type="button"
									onClick={() => addToCart(selectedProduct, selectedSize)}
									className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
								>
									{t("addToCart")}
								</button>
							</div>
						</DialogContent>
					</div>
				)}
			</Dialog>

			{/* Cart Sidebar */}
			<Dialog
				open={isCartOpen}
				onClose={() => setIsCartOpen(false)}
				overlayClassName="bg-black/50"
			>
				<DialogContent
					initial={{ x: "100%" }}
					animate={{ x: 0 }}
					exit={{ x: "100%" }}
					transition={{ type: "spring", damping: 25, stiffness: 200 }}
					className="fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
				>
					<div className="flex items-center justify-between p-6 border-b border-border">
						<DialogTitle className="font-heading font-bold text-xl text-primary-foreground">
							{t("cart")} ({cartCount})
						</DialogTitle>
						<DialogClose
							aria-label={t("closeCart")}
							className="p-2 text-muted-foreground hover:text-primary transition-colors"
						>
							<X className="w-6 h-6" aria-hidden="true" />
						</DialogClose>
					</div>

					<div className="flex-1 overflow-y-auto p-6">
						{cart.length === 0 ? (
							<div className="text-center py-12">
								<ShoppingBag
									className="w-16 h-16 text-muted-foreground mx-auto mb-4"
									aria-hidden="true"
								/>
								<p className="text-muted-foreground">{t("emptyCart")}</p>
							</div>
						) : (
							<ul className="space-y-4">
								{cart.map((item) => (
									<li
										key={`${item.id}-${item.selectedSize}`}
										className="flex gap-4 bg-muted p-4 rounded-lg"
									>
										<Image
											src={item.image}
											alt={item.name}
											width={80}
											height={80}
											className="w-20 h-20 object-cover rounded-lg"
										/>
										<div className="flex-1">
											<h3 className="font-heading font-bold text-primary-foreground">
												{item.name}
											</h3>
											{item.selectedSize && (
												<p className="text-sm text-muted-foreground">
													{t("size")}: {item.selectedSize}
												</p>
											)}
											<p className="text-primary font-bold">
												{formatPrice(item.price)}
											</p>
											<div className="flex items-center gap-2 mt-2">
												<button
													type="button"
													onClick={() =>
														updateQuantity(item.id, item.selectedSize, -1)
													}
													aria-label={`${t("decrease")}: ${item.name}`}
													className="p-1 bg-background rounded hover:bg-primary/10 transition-colors"
												>
													<Minus className="w-4 h-4" aria-hidden="true" />
												</button>
												<span className="w-8 text-center font-semibold">
													{item.quantity}
												</span>
												<button
													type="button"
													onClick={() =>
														updateQuantity(item.id, item.selectedSize, 1)
													}
													aria-label={`${t("increase")}: ${item.name}`}
													className="p-1 bg-background rounded hover:bg-primary/10 transition-colors"
												>
													<Plus className="w-4 h-4" aria-hidden="true" />
												</button>
												<button
													type="button"
													onClick={() =>
														removeFromCart(item.id, item.selectedSize)
													}
													aria-label={`${t("remove")}: ${item.name}`}
													className="ml-auto p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
												>
													<X className="w-4 h-4" aria-hidden="true" />
												</button>
											</div>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>

					{cart.length > 0 && (
						<div className="p-6 border-t border-border">
							<div className="flex items-center justify-between mb-4">
								<span className="text-muted-foreground">{t("total")}</span>
								<span className="font-heading font-bold text-2xl text-primary">
									{formatPrice(cartTotal)}
								</span>
							</div>
							<button
								type="button"
								className="w-full py-4 bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
							>
								{t("checkout")}
							</button>
							<p className="text-xs text-muted-foreground text-center mt-3">
								{t("checkoutDisclaimer")}
							</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default Store;
