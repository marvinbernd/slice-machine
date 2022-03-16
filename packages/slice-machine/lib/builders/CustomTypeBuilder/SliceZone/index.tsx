import { useContext, useEffect, useState } from "react";
import { Text, Box, Flex, Heading, Button } from "theme-ui";
import { LibrariesContext } from "@src/models/libraries/context";
import {
  SliceType,
  NonSharedSliceInSliceZone,
  SliceZoneAsArray,
} from "@lib/models/common/CustomType/sliceZone";

import SliceState from "@lib/models/ui/SliceState";
import LibraryState from "@lib/models/ui/LibraryState";

import ZoneHeader from "../../common/Zone/components/ZoneHeader";

import UpdateSliceZoneModal from "./UpdateSliceZoneModal";

import SlicesList from "./List";
import EmptyState from "./EmptyState";

export interface SliceZoneSlice {
  type: SliceType;
  payload: SliceState | NonSharedSliceInSliceZone;
}

const mapAvailableAndSharedSlices = (
  sliceZone: SliceZoneAsArray,
  libraries: ReadonlyArray<LibraryState> | null
) => {
  const availableSlices = (libraries || []).reduce(
    (acc: ReadonlyArray<SliceState>, curr: LibraryState) => {
      return [...acc, ...curr.components.map((e) => e[0])];
    },
    []
  );
  const {
    slicesInSliceZone,
    notFound,
  }: {
    slicesInSliceZone: ReadonlyArray<SliceZoneSlice>;
    notFound: ReadonlyArray<{ key: string }>;
  } = sliceZone.value.reduce(
    (
      acc: {
        slicesInSliceZone: ReadonlyArray<SliceZoneSlice>;
        notFound: ReadonlyArray<{ key: string }>;
      },
      { key, value }
    ) => {
      if (value.type === SliceType.Slice) {
        return {
          ...acc,
          slicesInSliceZone: [
            ...acc.slicesInSliceZone,
            { type: SliceType.Slice, payload: { key, value } },
          ],
        };
      }
      const maybeSliceState = availableSlices.find(
        (state) => state.infos.meta.id === key
      );

      if (maybeSliceState) {
        return {
          ...acc,
          slicesInSliceZone: [
            ...acc.slicesInSliceZone,
            { type: SliceType.SharedSlice, payload: maybeSliceState },
          ],
        };
      }
      return { ...acc, notFound: [...acc.notFound, { key }] };
    },
    { slicesInSliceZone: [], notFound: [] }
  );
  return { availableSlices, slicesInSliceZone, notFound };
};

const SliceZone = ({
  tabId,
  sliceZone,
  onSelectSharedSlices,
  onRemoveSharedSlice,
  onCreateSliceZone,
}: {
  tabId: string;
  sliceZone: SliceZoneAsArray;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSelectSharedSlices: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onRemoveSharedSlice: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onCreateSliceZone: Function;
}) => {
  const [formIsOpen, setFormIsOpen] = useState(false);
  const libraries = useContext(LibrariesContext);

  const { availableSlices, slicesInSliceZone, notFound } = sliceZone
    ? mapAvailableAndSharedSlices(sliceZone, libraries)
    : { availableSlices: [], slicesInSliceZone: [], notFound: [] };

  useEffect(() => {
    if (notFound?.length) {
      notFound.forEach(({ key }) => {
        onRemoveSharedSlice(key);
      });
    }
  }, [notFound]);

  const sharedSlicesInSliceZone = slicesInSliceZone
    .filter((e) => e.type === SliceType.SharedSlice)
    .map((e) => e.payload) as ReadonlyArray<SliceState>;

  /* Preserve these keys in SliceZone */
  const nonSharedSlicesKeysInSliceZone = slicesInSliceZone
    .filter((e) => e.type === SliceType.Slice)
    .map((e) => (e.payload as NonSharedSliceInSliceZone).key);

  const onAddNewSlice = () => {
    if (!sliceZone) {
      onCreateSliceZone();
    }
    setFormIsOpen(true);
  };

  return (
    <Box my={3}>
      <ZoneHeader
        Heading={<Heading as="h6">Slice Zone</Heading>}
        Actions={
          <Flex sx={{ alignItems: "center" }}>
            {sliceZone ? (
              <Text pr={3} sx={{ fontSize: "14px" }}>
                data.{sliceZone.key}
              </Text>
            ) : null}
            {!!slicesInSliceZone.length && (
              <Button variant="buttons.darkSmall" onClick={onAddNewSlice}>
                Update Slice Zone
              </Button>
            )}
          </Flex>
        }
      />
      {!slicesInSliceZone.length ? (
        <EmptyState onAddNewSlice={onAddNewSlice} />
      ) : (
        <SlicesList slices={slicesInSliceZone} />
      )}
      <UpdateSliceZoneModal
        isOpen={formIsOpen}
        formId={`tab-slicezone-form-${tabId}`}
        availableSlices={availableSlices}
        slicesInSliceZone={sharedSlicesInSliceZone}
        onSubmit={({ sliceKeys }) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          onSelectSharedSlices(sliceKeys, nonSharedSlicesKeysInSliceZone)
        }
        close={() => setFormIsOpen(false)}
      />
    </Box>
  );
};

export default SliceZone;