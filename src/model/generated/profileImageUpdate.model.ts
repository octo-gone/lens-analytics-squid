import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Profile} from "./profile.model"

@Entity_()
export class ProfileImageUpdate {
    constructor(props?: Partial<ProfileImageUpdate>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: false})
    oldImageUri!: string

    @Column_("text", {nullable: false})
    newImageUri!: string

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    profile!: Profile

    @Index_()
    @Column_("text", {nullable: false})
    txHash!: string

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
