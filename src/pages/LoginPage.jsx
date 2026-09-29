import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {authState, login} from "@/stores/authStore";
import {
    Button,
    FieldError,
    Form,
    Input,
    InputGroup,
    Label,
    Link,
    Separator, Spinner,
    TextField,
} from "@heroui/react";
import {Eye, EyeClosed} from "lucide-react";
import {toast} from "sonner";
import {useStore} from "@nanostores/react";
import {useTranslation} from "react-i18next";

export default function LoginPage() {
    const navigate = useNavigate();
    const $auth = useStore(authState);
    const {t} = useTranslation();
    const [authType, setAuthType] = useState($auth.authType || "basic");
    const [serverUrl, setServerUrl] = useState($auth.serverUrl || "");
    const [username, setUsername] = useState($auth.username || "");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const isAuthenticated =
            $auth.serverUrl &&
            (($auth.username && $auth.password) ||
                ($auth.authType === "token" && $auth.token));
        if (isAuthenticated) {
            navigate("/");
        }
    }, [
        $auth.serverUrl,
        $auth.username,
        $auth.password,
        $auth.token,
        $auth.authType,
        navigate,
    ]);

    useEffect(() => {
        if ($auth.serverUrl && !serverUrl) {
            setServerUrl($auth.serverUrl);
        }
        if ($auth.username && !username) {
            setUsername($auth.username);
        }
    }, [$auth.serverUrl, $auth.username]);

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
            <div className="w-full max-w-sm flex flex-col gap-6 p-6 bg-transparent">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {t("auth.login")}
                </h1>

                <Form
                    className="flex flex-col gap-4"
                    validationBehavior="native"
                    onSubmit={handleSubmit}
                >
                    <TextField isRequired name="serverUrl">
                        <Label>{t("auth.serverUrl")}</Label>
                        <Input
                            placeholder={t("auth.serverUrlPlaceholder")}
                            type="text"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            className="w-full"
                        />
                        <FieldError/>
                    </TextField>

                    {authType === "basic" ? (
                        <>
                            <TextField isRequired name="username">
                                <Label>{t("auth.username")}</Label>
                                <Input
                                    placeholder={t("auth.usernamePlaceholder")}
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full"
                                />
                                <FieldError/>
                            </TextField>

                            <TextField isRequired name="password">
                                <Label>{t("auth.password")}</Label>
                                <InputGroup>
                                    <InputGroup.Input
                                        placeholder={t("auth.passwordPlaceholder")}
                                        type={isVisible ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full"
                                    />
                                    <InputGroup.Suffix>
                                        <button
                                            type="button"
                                            onClick={() => setIsVisible(!isVisible)}
                                            aria-label="Toggle password visibility"
                                        >
                                            {isVisible ? (
                                                <EyeClosed
                                                    className="text-xl text-muted pointer-events-none shrink-0"/>
                                            ) : (
                                                <Eye className="text-xl text-muted pointer-events-none shrink-0"/>
                                            )}
                                        </button>
                                    </InputGroup.Suffix>
                                </InputGroup>
                                <FieldError/>
                            </TextField>
                        </>
                    ) : (
                        <TextField isRequired name="token">
                            <Label>{t("auth.token")}</Label>
                            <Input
                                placeholder={t("auth.tokenPlaceholder")}
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full"
                            />
                            <FieldError/>
                        </TextField>
                    )}

                    <div>
            <span className="text-sm">
              {t("auth.needMoreInfo")}
            </span>
                        <Link href="https://miniflux.app" size="sm">
                            {t("auth.visitMiniflux")}
                            <Link.Icon/>
                        </Link>
                    </div>
                    <Button
                        fullWidth
                        type="submit"
                        isPending={loading}
                    >
                        {loading && <Spinner color="current" size="sm"/>}
                        {t("common.login")}
                    </Button>
                </Form>
                <div className="relative flex items-center justify-center w-full -my-3">
                    <Separator className="absolute w-full"/>
                    <span className="text-sm bg-background px-2 z-10">
            {t("auth.or")}
          </span>
                </div>
                {authType === "token" ? (
                    <Button
                        fullWidth
                        variant="tertiary"
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
                        variant="tertiary"
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
