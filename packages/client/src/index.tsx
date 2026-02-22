/**
 * Configure contexts and render App
 */
import "./sentry";

import { JSX, onMount } from "solid-js";
import { render } from "solid-js/web";

import { attachDevtoolsOverlay } from "@solid-devtools/overlay";
import { Navigate, Route, Router, useParams } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import "material-symbols";
import "mdui/mdui.css";
import { PublicBot, PublicChannelInvite } from "voxly.js";

import FlowCheck from "@voxly/auth/src/flows/FlowCheck";
import FlowConfirmReset from "@voxly/auth/src/flows/FlowConfirmReset";
import FlowCreate from "@voxly/auth/src/flows/FlowCreate";
import FlowDeleteAccount from "@voxly/auth/src/flows/FlowDelete";
import FlowHome from "@voxly/auth/src/flows/FlowHome";
import FlowLogin from "@voxly/auth/src/flows/FlowLogin";
import FlowResend from "@voxly/auth/src/flows/FlowResend";
import FlowReset from "@voxly/auth/src/flows/FlowReset";
import FlowVerify from "@voxly/auth/src/flows/FlowVerify";
import { ClientContext, useClient } from "@voxly/client";
import { I18nProvider } from "@voxly/i18n";
import { KeybindContext } from "@voxly/keybinds";
import { ModalContext, ModalRenderer, useModals } from "@voxly/modal";
import { VoiceContext } from "@voxly/rtc";
import { StateContext, SyncWorker, useState } from "@voxly/state";
import { FloatingManager, LoadTheme } from "@voxly/ui";

/* @refresh reload */
import "@voxly/ui/styles";

import AuthPage from "./Auth";
import Interface from "./Interface";
import "./index.css";
import { DevelopmentPage } from "./interface/Development";
import { Discover } from "./interface/Discover";
import { Friends } from "./interface/Friends";
import { HomePage } from "./interface/Home";
import { ServerHome } from "./interface/ServerHome";
import { ChannelPage } from "./interface/channels/ChannelPage";
import "./serviceWorkerInterface";

attachDevtoolsOverlay();

/**
 * Redirect PWA start to the last active path
 */
function PWARedirect() {
  const state = useState();
  return <Navigate href={state.layout.getLastActivePath()} />;
}

/**
 * Open settings and redirect to last active path
 */
function SettingsRedirect() {
  const { openModal } = useModals();

  onMount(() => openModal({ type: "settings", config: "user" }));
  return <PWARedirect />;
}

/**
 * Open invite and redirect to last active path
 */
function InviteRedirect() {
  const params = useParams();
  const client = useClient();
  const { openModal, showError } = useModals();

  onMount(() => {
    if (params.code) {
      client()
        // TODO: add a helper to stoat.js for this
        .api.get(`/invites/${params.code as ""}`)
        .then((invite) => PublicChannelInvite.from(client(), invite))
        .then((invite) => openModal({ type: "invite", invite }))
        .catch(showError);
    }
  });

  return <PWARedirect />;
}

/**
 * Open bot invite and redirect to last active path
 */
function BotRedirect() {
  const params = useParams();
  const client = useClient();
  const { openModal, showError } = useModals();

  onMount(() => {
    if (params.code) {
      client()
        // TODO: add a helper to stoat.js for this
        .api.get(`/bots/${params.code as ""}/invite`)
        .then((invite) => new PublicBot(client(), invite))
        .then((invite) => openModal({ type: "add_bot", invite }))
        .catch(showError);
    }
  });

  return <PWARedirect />;
}

function MountContext(props: { children?: JSX.Element }) {
  const state = useState();

  /**
   * Tanstack Query client
   */
  const client = new QueryClient();

  return (
    <KeybindContext>
      <ModalContext>
        <ClientContext state={state}>
          <I18nProvider>
            <VoiceContext>
              <QueryClientProvider client={client}>
                {props.children}
                <ModalRenderer />
                <FloatingManager />
              </QueryClientProvider>
            </VoiceContext>
          </I18nProvider>
          <SyncWorker />
        </ClientContext>
      </ModalContext>
    </KeybindContext>
  );
}

render(
  () => (
    <StateContext>
      <Router root={MountContext}>
        <Route path="/login" component={AuthPage as never}>
          <Route path="/delete/:token" component={FlowDeleteAccount} />
          <Route path="/check" component={FlowCheck} />
          <Route path="/create" component={FlowCreate} />
          <Route path="/auth" component={FlowLogin} />
          <Route path="/resend" component={FlowResend} />
          <Route path="/reset" component={FlowReset} />
          <Route path="/verify/:token" component={FlowVerify} />
          <Route path="/reset/:token" component={FlowConfirmReset} />
          <Route path="/*" component={FlowHome} />
        </Route>
        <Route path="/" component={Interface as never}>
          <Route path="/pwa" component={PWARedirect} />
          <Route path="/dev" component={DevelopmentPage} />
          <Route path="/discover/*" component={Discover} />
          <Route path="/settings" component={SettingsRedirect} />
          <Route path="/invite/:code" component={InviteRedirect} />
          <Route path="/bot/:code" component={BotRedirect} />
          <Route path="/friends" component={Friends} />
          <Route path="/server/:server/*">
            <Route path="/channel/:channel/*" component={ChannelPage} />
            <Route path="/*" component={ServerHome} />
          </Route>
          <Route path="/channel/:channel/*" component={ChannelPage} />
          <Route path="/*" component={HomePage} />
        </Route>
      </Router>

      <LoadTheme />
      {/* <ReportBug /> */}
    </StateContext>
  ),
  document.getElementById("root") as HTMLElement,
);
