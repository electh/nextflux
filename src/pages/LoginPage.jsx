import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authState, login } from "@/stores/authStore";
import { Button, Form, Input, Link, Divider } from "@heroui/react";
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
      console.log(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6 p-6 bg-content1 rounded-lg shadow-custom">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("auth.login")}
        </h1>

        <Form
          className="flex flex-col gap-4"
          validationBehavior="native"
          onSubmit={handleSubmit}
        >
          <Input
            isRequired
            labelPlacement="outside"
            label={t("auth.serverUrl")}
            name="serverUrl"
            placeholder={t("auth.serverUrlPlaceholder")}
            type="text"
            variant="faded"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            classNames={{ helperWrapper: "hidden!" }}
          />

          {authType === "basic" ? (
            <>
              <Input
                isRequired
                labelPlacement="outside"
                label={t("auth.username")}
                name="username"
                placeholder={t("auth.usernamePlaceholder")}
                type="text"
                variant="faded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                classNames={{ helperWrapper: "hidden!" }}
              />
              <Input
                isRequired
                labelPlacement="outside"
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                  >
                    {isVisible ? (
                      <EyeClosed className="text-xl text-default-400 pointer-events-none shrink-0" />
                    ) : (
                      <Eye className="text-xl text-default-400 pointer-events-none shrink-0" />
                    )}
                  </button>
                }
                label={t("auth.password")}
                name="password"
                placeholder={t("auth.passwordPlaceholder")}
                type={isVisible ? "text" : "password"}
                variant="faded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                classNames={{ helperWrapper: "hidden!" }}
              />
            </>
          ) : (
            <Input
              isRequired
              labelPlacement="outside"
              label={t("auth.token")}
              name="token"
              placeholder={t("auth.tokenPlaceholder")}
              type="text"
              variant="faded"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              classNames={{ helperWrapper: "hidden!" }}
            />
          )}

          <div>
            <span className="text-sm text-default-500">
              {t("auth.needMoreInfo")}
            </span>
            <Link href="https://miniflux.app" size="sm">
              {t("auth.visitMiniflux")}
            </Link>
          </div>
          <Button
            className="w-full bg-primary bg-linear-to-b from-white/15 to-transparent border-primary border shadow-custom-button"
            color="primary"
            type="submit"
            isLoading={loading}
          >
            {t("common.login")}
          </Button>
        </Form>
        <div className="relative flex items-center justify-center w-full -my-3">
          <Divider className="absolute w-full" />
          <span className="text-sm text-default-500 bg-content1 px-2 z-10">
            {t("auth.or")}
          </span>
        </div>
        {authType === "token" ? (
          <Button
            fullWidth
            variant="bordered"
            className="text-default-500"
            onPress={() => {
              setAuthType("basic");
              setUsername("");
              setPassword("");
              setToken("");
            }}
          >
            {t("auth.basicAuth")}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="bordered"
            className="text-default-500"
            onPress={() => {
              setAuthType("token");
              setToken("");
            }}
          >
            {t("auth.tokenAuth")}
          </Button>
        )}
      </div>
    </div>
  );
}
