import { ValidatorFn } from '@angular/forms';

export const COLOMBIAN_PLATE_REGEX = /^(?:[A-Z]{3}(?:\d{3}|\d{2}[A-Z]?)|[RS]\d{5}|(?:CD|CC|AT|OI)\d{4})$/;

export function isValidColombianPlate(plate: string): boolean {
  return COLOMBIAN_PLATE_REGEX.test(plate);
}

export const colombianPlateValidator: ValidatorFn = (control) => {
  const plate = String(control.value ?? '');
  return !plate || isValidColombianPlate(plate) ? null : { invalidColombianPlate: true };
};