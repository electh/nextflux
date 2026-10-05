import { useState } from "react";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
import { Form } from "@base-ui/react/form";
import { Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import CustomModal from "@/components/ui/CustomModal.jsx";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { addAccountModalOpen } from "@/stores/modalStore.js";
import { login, sessionAccount } from "@/stores/authStore.js";

export default function AddAccountModal() {
  const { t } = useTranslation();
  const open = useStore(addAccountModalOpen);
  const [authType, setAuthType] = useState("basic");
  const [serverUrl, setServerUrl] = useState(sessionAccount.serverUrl);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const isToken = authType === "token";

  const close = () => {
    if (!loading) addAccountModalOpen.set(false);
  };
  const reset = () => {
    setAuthType("basic");
    setServerUrl(sessionAccount.serverUrl);
    setUsername("");
    setPassword("");
    setToken("");
    setVisible(false);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await login(
        serverUrl,
        isToken ? "" : username,
        isToken ? "" : password,
        isToken ? token : "",
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCredential = (credential) => (
    <Field data-disabled={loading}>
      <FieldLabel htmlFor={`account-${credential}`}>
        {t(`auth.${credential}`)}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={`account-${credential}`}
          name={credential}
          required
          disabled={loading}
          type={visible ? "text" : "password"}
          autoComplete={credential === "token" ? "off" : "current-password"}
          placeholder={t(`auth.${credential}Placeholder`)}
          value={credential === "token" ? token : password}
          onChange={(event) =>
            credential === "token"
              ? setToken(event.target.value)
              : setPassword(event.target.value)
          }
        />
        <InputGroupAddon align="inline-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={loading}
            aria-label={t("auth.toggleCredentialVisibility")}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeClosed /> : <Eye />}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <FieldError />
    </Field>
  );

  return (
    <CustomModal
      open={open}
      onOpenChange={close}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) reset();
      }}
      title={t("sidebar.profile.addAccount")}
      footer={
        <>
          <Button variant="secondary" disabled={loading} onClick={close}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="add-account-form"
            disabled={loading}
            aria-busy={loading}
          >
            {loading && <Spinner data-icon="inline-start" />}
            {t("common.login")}
          </Button>
        </>
      }
    >
      <Form id="add-account-form" className="px-4 pb-4" onSubmit={submit}>
        <FieldSet disabled={loading}>
          <FieldGroup>
            <Field data-disabled={loading}>
              <FieldLabel htmlFor="account-server-url">
                {t("auth.serverUrl")}
              </FieldLabel>
              <Input
                id="account-server-url"
                name="serverUrl"
                required
                disabled={loading}
                placeholder={t("auth.serverUrlPlaceholder")}
                value={serverUrl}
                onChange={(event) => setServerUrl(event.target.value)}
              />
              <FieldError />
            </Field>
            {!isToken ? (
              <>
                <Field data-disabled={loading}>
                  <FieldLabel htmlFor="account-username">
                    {t("auth.username")}
                  </FieldLabel>
                  <Input
                    id="account-username"
                    name="username"
                    required
                    disabled={loading}
                    autoComplete="username"
                    placeholder={t("auth.usernamePlaceholder")}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                  <FieldError />
                </Field>
                {renderCredential("password")}
              </>
            ) : (
              renderCredential("token")
            )}
          </FieldGroup>
          <div className="relative flex w-full items-center justify-center">
            <Separator className="absolute w-full" />
            <span className="relative bg-card px-2 text-sm">
              {t("auth.or")}
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            className="w-full"
            onClick={() => {
              setAuthType(isToken ? "basic" : "token");
              setVisible(false);
            }}
          >
            {t(isToken ? "auth.basicAuth" : "auth.tokenAuth")}
          </Button>
        </FieldSet>
      </Form>
    </CustomModal>
  );
}
