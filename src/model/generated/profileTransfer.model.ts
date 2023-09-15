import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import {Profile} from "./profile.model"

@Entity_()
export class ProfileTransfer {
    constructor(props?: Partial<ProfileTransfer>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    from!: string

    @Index_()
    @Column_("text", {nullable: false})
    to!: string

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
