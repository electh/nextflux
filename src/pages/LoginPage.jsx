import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Form } from "@base-ui/react/form";
import { ArrowUpRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authState, login } from "@/stores/authStore";
import { Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
export default function LoginPage() {
  const navigate = useNavigate();
  const $auth = useStore(authState);
  const { t } = useTranslation();
  const [authType, setAuthType] = useState("basic");
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if ($auth.serverUrl && $auth.username && $auth.password) {
      navigate("/");
    }
  }, [$auth.serverUrl, $auth.username, $auth.password, navigate]);
  useEffect(() => {
    if (!localStorage.getItem("refreshed")) {
      window.location.reload();
      localStorage.setItem("refreshed", "true");
    }
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    const {
      serverUrl: urlServerUrl,
      token: urlToken,
      username: urlUsername,
      password: urlPassword,
    } = Object.fromEntries(url.searchParams);
    if (urlServerUrl) {
      setServerUrl(urlServerUrl);
      if (urlUsername && urlPassword) {
        setAuthType("basic");
        setUsername(urlUsername);
        setPassword(urlPassword);
      } else if (urlToken) {
        setAuthType("token");
        setToken(urlToken);
      }
    }
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(
        serverUrl,
        authType === "basic" ? username : "",
        authType === "basic" ? password : "",
        authType === "token" ? token : "",
      );
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm flex flex-col gap-6 p-6 bg-transparent">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("auth.login")}
        </h1>

        <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="serverUrl">{t("auth.serverUrl")}</FieldLabel>
            <Input
              placeholder={t("auth.serverUrlPlaceholder")}
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full"
              required={true}
              name="serverUrl"
              id="serverUrl"
            />
            <FieldError />
          </Field>

          {authType === "basic" ? (
            <>
              <Field>
                <FieldLabel htmlFor="username">{t("auth.username")}</FieldLabel>
                <Input
                  placeholder={t("auth.usernamePlaceholder")}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  required={true}
                  name="username"
                  id="username"
                />
                <FieldError />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">{t("auth.password")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    placeholder={t("auth.passwordPlaceholder")}
                    type={isVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    required={true}
                    name="password"
                    id="password"
                  />
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      onClick={() => setIsVisible(!isVisible)}
                      aria-label="Toggle password visibility"
                    >
                      {isVisible ? (
                        <EyeClosed className="text-xl text-muted-foreground pointer-events-none shrink-0" />
                      ) : (
                        <Eye className="text-xl text-muted-foreground pointer-events-none shrink-0" />
                      )}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError />
              </Field>
            </>
          ) : (
            <Field>
              <FieldLabel htmlFor="token">{t("auth.token")}</FieldLabel>
              <Input
                placeholder={t("auth.tokenPlaceholder")}
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full"
                required={true}
                name="token"
                id="token"
              />
              <FieldError />
            </Field>
          )}

          <div>
            <span className="text-sm">{t("auth.needMoreInfo")}</span>
            <a
              href="https://miniflux.app"
              className="inline-flex items-center gap-1 text-sm"
            >
              {t("auth.visitMiniflux")}
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          <Button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full"
          >
            {loading && <Spinner />}
            {t("common.login")}
          </Button>
        </Form>
        <div className="relative flex items-center justify-center w-full -my-3">
          <Separator className="absolute w-full" />
          <span className="text-sm bg-background px-2 z-10">
            {t("auth.or")}
          </span>
        </div>
        {authType === "token" ? (
          <Button
            variant="secondary"
            onClick={() => {
              setAuthType("basic");
              setUsername("");
              setPassword("");
              setToken("");
            }}
            className="w-full"
          >
            {t("auth.basicAuth")}
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              setAuthType("token");
              setToken("");
            }}
            className="w-full"
          >
            {t("auth.tokenAuth")}
          </Button>
        )}
      </div>
    </div>
  );
}
