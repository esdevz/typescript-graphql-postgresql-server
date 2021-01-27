import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";
import Users from "../db/modules/Users";

export function IsUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsUnique",
      async: true,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          return new Promise((ok) => {
            Users.getUser(args.property, value).then((user) => {
              if (!user) {
                return ok(true);
              } else {
                return ok(false);
              }
            });
          });
        },
      },
    });
  };
}
