import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'auth_id', nullable: true })
  authId?: string;

  @Column(() => Address, { prefix: false })
  address?: Address;

  @Column({ name: 'phone_number', nullable: true, unique: true })
  phoneNumber?: string;

  @Column({ name: 'birth_date', nullable: true })
  birthDate?: Date;

  @Column({ nullable: true })
  gender?: string;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture?: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'is_unsynced', nullable: true })
  isUnsynced?: boolean;

  @Column({ name: 'last_unsynced_at', nullable: true })
  lastUnsyncedAt?: Date;

  @Column({ nullable: true })
  enabled?: boolean;

  @Column({ name: 'email_verified', nullable: true })
  emailVerified?: boolean;

  withoutAuthId(): User {
    const filtered = Object.entries(this).filter(([key]) => key !== 'authId');
    return Object.assign(new User(), Object.fromEntries(filtered));
  }
}
