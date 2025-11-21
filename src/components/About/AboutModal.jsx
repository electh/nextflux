import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";
import { aboutModalOpen } from "@/stores/modalStore";
import { NotFancyLogo } from "@/components/About/NotFancyLogo.jsx";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { Heart, Info, X } from "lucide-react";
import { popUpVariants } from "@/lib/motion";

export default function AboutModal() {
  const { t } = useTranslation();
  const $aboutModalOpen = useStore(aboutModalOpen);

  return (
    <>
      <Modal
        isOpen={$aboutModalOpen}
        radius="md"
        motionProps={{
          variants: popUpVariants,
        }}
        scrollBehavior="inside"
        onOpenChange={(value) => {
          aboutModalOpen.set(value);
        }}
        classNames={{
          base: "mb-safe-offset-2 mt-2 mx-2 max-h-[80vh] h-[612px] overflow-hidden shadow-custom!",
          header:
            "border-b flex flex-col gap-3 p-3 bg-content1 dark:bg-transparent",
          footer: "hidden",
          body: "modal-body p-0 block!",
          closeButton: "hidden",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>
                <div className="flex gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <span className="text-base font-medium">
                      {t("about.title")}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    radius="full"
                    variant="light"
                    isIconOnly
                    onPress={() => {
                      aboutModalOpen.set(false);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="overflow-y-auto flex flex-col gap-4">
                  <NotFancyLogo since={2025} />

                  {/* Made with love section */}
                  <div className="text-center text-default-500 px-3">
                    Made with{" "}
                    <span className="text-danger">
                      <Heart className="size-3 fill-current inline-block" />
                    </span>{" "}
                    by{" "}
                    <a
                      href="https://github.com/electh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      electh
                    </a>
                  </div>

                  {/* Acknowledgments section */}
                  <div className="flex flex-col gap-2 items-center px-3 pb-3">
                    {t("about.acknowledgments")}
                    <div className="flex flex-col gap-0.5 items-center justify-center text-sm">
                      <a
                        href="https://reederapp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Reeder
                      </a>
                      <a
                        href="https://www.heroui.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        HeroUI
                      </a>
                      <a
                        href="https://tailwindcss.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        TailwindCSS
                      </a>
                      <a
                        href="https://www.vidstack.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Vidstack
                      </a>
                      <a
                        href="https://react-photo-view.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        React-photo-view
                      </a>
                      <a
                        href="https://shiki.matsu.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Shiki
                      </a>
                      <a
                        href="https://virtuoso.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Virtuoso
                      </a>
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
