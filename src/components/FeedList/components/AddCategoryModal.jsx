import { Form } from "@base-ui/react/form";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { addCategoryModalOpen } from "@/stores/modalStore";
import { useStore } from "@nanostores/react";
import minifluxAPI from "@/api/miniflux";
import { categories } from "@/stores/feedsStore";
import { toast } from "sonner";
import CategoryChip from "./CategoryChip.jsx";
import { useTranslation } from "react-i18next";
import CustomModal from "@/components/ui/CustomModal.jsx";
import { addCategory } from "@/db/storage";
import { reportError } from "@/lib/errors.js";
export default function AddCategoryModal() {
  const { t } = useTranslation();
  const $addCategoryModalOpen = useStore(addCategoryModalOpen);
  const $categories = useStore(categories);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const onClose = () => {
    addCategoryModalOpen.set(false);
    setTitle("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newCategory = await minifluxAPI.createCategory(title);
      await addCategory({
        id: newCategory.id,
        title: newCategory.title,
      });
      categories.set([
        ...$categories,
        {
          id: newCategory.id,
          title: newCategory.title,
        },
      ]);
      onClose();
      toast.success(t("common.success"));
    } catch (error) {
      reportError(error, "category.create");
    } finally {
      setLoading(false);
    }
  };
  return (
    <CustomModal
      open={$addCategoryModalOpen}
      onOpenChange={onClose}
      title={t("sidebar.addCategory")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full">
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="add-category-form"
            disabled={loading}
            aria-busy={loading}
            className="w-full"
          >
            {loading && <Spinner />}
            {t("common.save")}
          </Button>
        </>
      }
    >
      <Form
        id="add-category-form"
        className="w-full px-4 pb-4"
        onSubmit={handleSubmit}
      >
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">
                {t("sidebar.categoryName")}
              </FieldLabel>
              <Input
                placeholder={t("sidebar.categoryNamePlaceholder")}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required={true}
                name="title"
                id="title"
              />
              <FieldError>{t("sidebar.categoryNameRequired")}</FieldError>
            </Field>
          </FieldGroup>
          <Separator className="my-2" />
          <div className="flex flex-wrap gap-2 p-3 w-full rounded-2xl bg-default/60 shadow-surface">
            {$categories.map((category) => (
              <CategoryChip key={category.id} category={category} />
            ))}
          </div>
        </FieldSet>
      </Form>
    </CustomModal>
  );
}
