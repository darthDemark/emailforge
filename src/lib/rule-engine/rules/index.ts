import type { Rule } from "@/lib/rule-engine/types";
import { outlookRules } from "@/lib/rule-engine/rules/outlook";
import { gmailRules } from "@/lib/rule-engine/rules/gmail";
import { structureRules } from "@/lib/rule-engine/rules/structure";
import { accessibilityRules } from "@/lib/rule-engine/rules/accessibility";
import { mobileRules } from "@/lib/rule-engine/rules/mobile";
import { darkModeRules } from "@/lib/rule-engine/rules/darkmode";
import { deliverabilityRules } from "@/lib/rule-engine/rules/deliverability";
import { codeQualityRules } from "@/lib/rule-engine/rules/code-quality";
import { conversionRules } from "@/lib/rule-engine/rules/conversion";
import { performanceRules } from "@/lib/rule-engine/rules/performance";
import { maintainabilityRules } from "@/lib/rule-engine/rules/maintainability";
import { clientCompatRules } from "@/lib/rule-engine/rules/client-compat";

/**
 * Master rule registry. Append new rule modules here. The engine iterates this
 * array, so adding hundreds of rules requires no engine changes.
 */
export const allRules: Rule[] = [
  ...outlookRules,
  ...gmailRules,
  ...structureRules,
  ...accessibilityRules,
  ...mobileRules,
  ...darkModeRules,
  ...deliverabilityRules,
  ...codeQualityRules,
  ...conversionRules,
  ...performanceRules,
  ...maintainabilityRules,
  ...clientCompatRules,
];
