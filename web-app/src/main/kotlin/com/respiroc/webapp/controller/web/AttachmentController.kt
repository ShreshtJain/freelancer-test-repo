package com.respiroc.webapp.controller.web

import com.respiroc.webapp.AttachmentRepository
import com.respiroc.webapp.AttachmentService
import com.respiroc.webapp.controller.BaseController
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/attachment")
class AttachmentController(
    private val attachmentRepository: AttachmentRepository,
    private val attachmentService: AttachmentService
) : BaseController(){

    @GetMapping(value = [])
    fun voucher(): String {
        return "redirect:/attachment/pdf"
    }

    // Get all PDFs list
    // If embeded or iframe were to be used, it could have made the application faster but pdf.js makes the applications slow and complicated
    @GetMapping("/pdf")
    fun listAttachments(
        model: Model
    ): String {
        addCommonAttributesForCurrentTenant(model, "Attachment")
        model.addAttribute("attachments", attachmentRepository.findAll())

        //System.out.printf("Inside /pdf");

        return "attachment/attachment"
    }

    @GetMapping("/pdf/view/{id}")
    fun showPdfViewer(@PathVariable id: Long, model: Model): String {
        val attachment = attachmentRepository.findById(id).orElseThrow()
        model.addAttribute("id", attachment.id)
        model.addAttribute("filename", attachment.filename)
        addCommonAttributesForCurrentTenant(model, "View PDF")
        return "attachment/attachment-view"
    }

    // Display each pdf separately
    @GetMapping("/pdf/content/{id}")
    fun viewPdf(@PathVariable id: Long): ResponseEntity<ByteArray> {

        val attachment = attachmentRepository.findById(id).orElseThrow {
            RuntimeException("Attachment not found with id $id")
        }

        val (pdfBytes, pdfFilename, pdfMimeType) = attachmentService.convertToPdf(
            attachment.fileData, attachment.filename, attachment.mimetype
        )

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"$pdfFilename\"")
            .contentType(MediaType.parseMediaType(pdfMimeType))
            .body(pdfBytes)
    }
}