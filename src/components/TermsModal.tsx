"use client";

import { useTranslations } from "next-intl";
import LegalModal, { LegalContactEmail, LegalSection } from "./LegalModal";

interface TermsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
	const t = useTranslations("terms");

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
				title={t("sections.useOfSite.title")}
				content={t("sections.useOfSite.content")}
				items={[
					t("sections.useOfSite.items.item1"),
					t("sections.useOfSite.items.item2"),
					t("sections.useOfSite.items.item3"),
				]}
			/>
			<LegalSection
				title={t("sections.intellectualProperty.title")}
				content={t("sections.intellectualProperty.content")}
			/>
			<LegalSection
				title={t("sections.userContent.title")}
				content={t("sections.userContent.content")}
			/>
			<LegalSection
				title={t("sections.eventsServices.title")}
				content={t("sections.eventsServices.content")}
				items={[
					t("sections.eventsServices.items.item1"),
					t("sections.eventsServices.items.item2"),
					t("sections.eventsServices.items.item3"),
				]}
			/>
			<LegalSection
				title={t("sections.liability.title")}
				content={t("sections.liability.content")}
			/>
			<LegalSection
				title={t("sections.changes.title")}
				content={t("sections.changes.content")}
			/>
			<LegalSection
				title={t("sections.governingLaw.title")}
				content={t("sections.governingLaw.content")}
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

export default TermsModal;
