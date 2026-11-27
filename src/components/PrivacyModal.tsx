"use client";

import { useTranslations } from "next-intl";
import LegalModal, { LegalContactEmail, LegalSection } from "./LegalModal";

interface PrivacyModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const PrivacyModal = ({ isOpen, onClose }: PrivacyModalProps) => {
	const t = useTranslations("privacy");

	return (
		<LegalModal
			isOpen={isOpen}
			onClose={onClose}
			title={t("title")}
			lastUpdated={`${t("lastUpdated")}: ${t("updateDate")}`}
		>
			<LegalSection
				title={t("sections.intro.title")}
				content={t("sections.intro.content")}
			/>
			<LegalSection
				title={t("sections.dataCollection.title")}
				content={t("sections.dataCollection.content")}
				items={[
					t("sections.dataCollection.items.item1"),
					t("sections.dataCollection.items.item2"),
					t("sections.dataCollection.items.item3"),
					t("sections.dataCollection.items.item4"),
				]}
			/>
			<LegalSection
				title={t("sections.dataUse.title")}
				content={t("sections.dataUse.content")}
				items={[
					t("sections.dataUse.items.item1"),
					t("sections.dataUse.items.item2"),
					t("sections.dataUse.items.item3"),
					t("sections.dataUse.items.item4"),
				]}
			/>
			<LegalSection
				title={t("sections.dataProtection.title")}
				content={t("sections.dataProtection.content")}
			/>
			<LegalSection
				title={t("sections.cookies.title")}
				content={t("sections.cookies.content")}
			/>
			<LegalSection
				title={t("sections.thirdParties.title")}
				content={t("sections.thirdParties.content")}
			/>
			<LegalSection
				title={t("sections.userRights.title")}
				content={t("sections.userRights.content")}
				items={[
					t("sections.userRights.items.item1"),
					t("sections.userRights.items.item2"),
					t("sections.userRights.items.item3"),
					t("sections.userRights.items.item4"),
				]}
			/>
			<LegalSection
				title={t("sections.contact.title")}
				content={t("sections.contact.content")}
			>
				<LegalContactEmail />
			</LegalSection>
		</LegalModal>
	);
};

export default PrivacyModal;
