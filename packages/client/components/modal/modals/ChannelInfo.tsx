import { Trans } from "@lingui-solid/solid/macro";

import { Markdown } from "@voxly/markdown";
import { Dialog, DialogProps } from "@voxly/ui";

import { Modals } from "../types";

export function ChannelInfoModal(
  props: DialogProps & Modals & { type: "channel_info" },
) {
  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={`#${props.channel.name}`}
      actions={[{ text: <Trans>Close</Trans> }]}
    >
      <Markdown content={props.channel.description!} />
    </Dialog>
  );
}
