import { ComponentProps } from "react";
import { colors } from "../theme/provider";
import PrimaryButton from "./PrimaryButton";

export default function ProviderPrimaryButton({ style, ...props }: ComponentProps<typeof PrimaryButton>) {
  return <PrimaryButton {...props} style={{ backgroundColor: colors.primary, borderRadius: 18, minHeight: 56, ...style }} />;
}
