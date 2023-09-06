import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"

@Entity_()
export class Follow {
    constructor(props?: Partial<Follow>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    follower!: string

    @Column_("jsonb", {nullable: false})
    profileIds!: unknown

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
