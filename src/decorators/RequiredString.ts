import { registerDecorator, ValidationOptions } from "class-validator";

export function RequiredString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsUnique",
      async: true,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return typeof value === "string" && value.trim().length > 0;
        },
      },
    });
  };
}
