import React, { Fragment, useState } from "react";
import { Box, Button, Spinner, Text } from "theme-ui";

import {
  CustomTypeState,
  CustomTypeStatus,
} from "@lib/models/ui/CustomTypeState";
import { handleRemoteResponse, ToastPayload } from "@src/modules/toaster/utils";
import CustomTypeStore from "@src/models/customType/store";

import Header from "../../../../components/Header";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { MdSpaceDashboard } from "react-icons/md";

const CustomTypeHeader = ({
  Model,
  store,
}: {
  Model: CustomTypeState;
  store: CustomTypeStore;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { openLoginModal, openToaster } = useSliceMachineActions();

  const buttonProps = (() => {
    if (Model.isTouched) {
      return {
        onClick: () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          store.save(Model);
        },
        children: <span>Save to File System</span>,
      };
    }
    if (
      [CustomTypeStatus.New, CustomTypeStatus.Modified].includes(
        Model.__status as CustomTypeStatus
      )
    ) {
      return {
        onClick: () => {
          if (!isLoading) {
            setIsLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            store.push(Model, (data: ToastPayload): void => {
              if (!data.done) {
                return;
              }
              setIsLoading(false);
              handleRemoteResponse(openToaster)(data);
              if (data.error && data.status === 403) {
                openLoginModal();
              }
            });
          }
        },
        children: (
          <span>
            {isLoading ? (
              <Spinner
                color="#F7F7F7"
                size={20}
                mr={2}
                sx={{ position: "relative", top: "5px", left: "3px" }}
              />
            ) : null}
            Push to Prismic
          </span>
        ),
      };
    }
    return { variant: "disabled", children: "Synced with Prismic" };
  })();

  return (
    <Header
      MainBreadcrumb={
        <Fragment>
          <MdSpaceDashboard /> <Text ml={2}>Custom Types</Text>
        </Fragment>
      }
      SecondaryBreadcrumb={
        <Box sx={{ fontWeight: "thin" }} as="span">
          <Text ml={2}>/ {Model.current.label} </Text>
        </Box>
      }
      breadrumbHref="/"
      ActionButton={<Button {...buttonProps} />}
    />
  );
};

export default CustomTypeHeader;