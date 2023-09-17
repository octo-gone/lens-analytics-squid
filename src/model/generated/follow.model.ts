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
    nftOwnerAddress!: string

    @Column_("text", {array: true, nullable: true})
    profileIds!: (string)[] | undefined | null

    @Column_("text", {array: true, nullable: true})
    followModuleDatas!: (string)[] | undefined | null

    @Index_()
    @Column_("text", {nullable: false})
    txHash!: string

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
