import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class Profile {
    constructor(props?: Partial<Profile>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    profileId!: bigint

    @Index_()
    @Column_("text", {nullable: false})
    address!: string

    @Index_()
    @Column_("text", {nullable: false})
    handle!: string

    @Column_("text", {nullable: false})
    imageUri!: string

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
