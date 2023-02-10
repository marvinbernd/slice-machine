import React from "react";

import { Text } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Button } from "@components/Button";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isModalOpen } from "@src/modules/modal";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { isRemoteOnly } from "@lib/models/common/ModelData";
import { ToasterType } from "@src/modules/toaster";
import { CommonDeleteDocumentsDrawer } from "./CommonDeleteDocumentsDrawer";
import { getModelId } from "@lib/models/common/ModelData";
import { AssociatedDocumentsCard } from "./AssociatedDocumentsCard";

export const HardDeleteDocumentsDrawer: React.FunctionComponent = () => {
  const { isDeleteDocumentsDrawerOpen, remoteOnlyCustomTypes, modalData } =
    useSelector((store: SliceMachineStoreType) => ({
      isDeleteDocumentsDrawerOpen: isModalOpen(
        store,
        ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER
      ),
      remoteOnlyCustomTypes: selectAllCustomTypes(store).filter(isRemoteOnly),
      modalData: store.pushChanges,
    }));

  const { pushChanges, closeModals, openToaster } = useSliceMachineActions();

  if (!isDeleteDocumentsDrawerOpen) return null;

  if (!modalData?.details.customTypes) {
    openToaster("No change data", ToasterType.ERROR);
    return null;
  }

  const associatedDocumentsCards = modalData.details.customTypes.map(
    (customTypeDetail) => {
      const customType = remoteOnlyCustomTypes.find(
        (customType) => getModelId(customType) === customTypeDetail.id
      );
      if (customType === undefined) return null;

      return (
        <AssociatedDocumentsCard
          isOverLimit
          key={customTypeDetail.id}
          ctName={customType.remote.label ?? customType.remote.id}
          link={customTypeDetail.url}
          numberOfDocuments={customTypeDetail.numberOfDocuments}
        />
      );
    }
  );

  return (
    <CommonDeleteDocumentsDrawer
      isOpen={isDeleteDocumentsDrawerOpen}
      title="Manual action required"
      footer={
        <Button
          label="Try again"
          variant="primary"
          onClick={() => {
            closeModals();
            pushChanges({});
          }}
          sx={{
            fontWeight: "bold",
            color: "white",
            borderRadius: 6,
            width: "100%",
          }}
        />
      }
      explanations={
        <>
          <Text sx={{ fontWeight: "bold", mb: 1, lineHeight: "24px" }}>
            Your Custom Type{modalData.details.customTypes.length > 1 && "s"}{" "}
            cannot be deleted.
          </Text>
          <Text sx={{ mb: 24 }}>
            {modalData.details.customTypes.length > 1
              ? "These Custom Types have"
              : "This Custom Type has"}{" "}
            too many associated Documents. Archive and delete these Documents
            manually and then try deleting the Custom Types again.
          </Text>
          {associatedDocumentsCards}
        </>
      }
    />
  );
};
