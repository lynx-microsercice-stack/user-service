import { Column } from 'typeorm';

export class Address {
  @Column({ nullable: true, name: 'street' })
  street: string;

  @Column({ nullable: true, name: 'city' })
  city: string;

  @Column({ nullable: true, name: 'district' })
  district: string;

  @Column({ nullable: true, name: 'country' })
  country: string;

  @Column({ nullable: true, name: 'postal_code' })
  postalCode: string;
}
