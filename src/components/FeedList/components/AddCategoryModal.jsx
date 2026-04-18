import {
  Button,
  Separator,
  Input,
  Fieldset,
  FieldGroup,
  TextField,
  Label,
  FieldError,
  Spinner,
  Form,
} from "@heroui/react";
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
      await addCategory({ id: newCategory.id, title: newCategory.title });
      categories.set([
        ...$categories,
        { id: newCategory.id, title: newCategory.title },
      ]);
      onClose();
      toast.success(t("common.success"));
    } catch (error) {
      console.error("添加分类失败:", error);
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
          <Button variant="tertiary" onPress={onClose} fullWidth>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="add-category-form"
            isPending={loading}
            fullWidth
          >
            {loading && <Spinner color="current" size="sm" />}
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
        <Fieldset>
          <FieldGroup>
            <TextField isRequired name="title" variant="secondary">
              <Label>{t("sidebar.categoryName")}</Label>
              <Input
                placeholder={t("sidebar.categoryNamePlaceholder")}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <FieldError>{t("sidebar.categoryNameRequired")}</FieldError>
            </TextField>
          </FieldGroup>
          <Separator className="my-2" />
          <div className="flex flex-wrap gap-2 p-3 w-full rounded-2xl bg-default/60 shadow-surface">
            {$categories.map((category) => (
              <CategoryChip key={category.id} category={category} />
            ))}
          </div>
        </Fieldset>
      </Form>
    </CustomModal>
  );
}
